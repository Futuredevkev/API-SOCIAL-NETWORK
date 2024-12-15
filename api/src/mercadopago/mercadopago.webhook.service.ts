import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'mercadopago';
import * as crypto from 'crypto';

import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentsService } from '../payments/payments.service';
import { WsMessageGateway } from '../ws-message/ws-message.gateway';
import {
  BodyWebhookMP,
  HeadersMP,
  QueryParamsMP,
} from 'src/types/type.verification-webhook';

interface StatusPayment {
  status: string;
  status_detail: string;
}

@Injectable()
export class MercadopagoWebhookService {
  constructor(
    @Inject('MERCADO_PAGO')
    private readonly payment: Payment,
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
    private readonly wsMessageGateway: WsMessageGateway,
  ) {}

  private readonly SECRET_WEBHOOK: string =
    this.configService.get('SECRET_WEBHOOK_MP');

  async handleWebhook(
    header: HeadersMP,
    body: BodyWebhookMP,
    querys: QueryParamsMP,
  ): Promise<{ status: string }> {
    const verify = await this.verifyWebhook(header, querys);

    if (!verify) {
      throw new BadRequestException('Webhook invalid');
    }

    if (!body.action.includes('payment')) {
      throw new BadRequestException('This is not payment');
    }
    const payment = await this.payment.get({ id: body.data.id });
    const orderId = payment.metadata.id_order as string;

    const validPayment = this.paymentValidation(payment);

    if (validPayment) {
      if (
        validPayment.status === 'pending' ||
        validPayment.status === 'in_process'
      ) {
        this.wsMessageGateway.sendNotification(orderId, 'Payment pending');
        return {
          status: validPayment.status,
        };
      }
      if (
        validPayment.status === 'approved' ||
        validPayment.status === 'authorized'
      ) {
        const paymentComplete = await this.paymentsService.registerPayment(
          orderId,
          payment,
        );
        this.wsMessageGateway.sendNotification(
          orderId,
          'Payment completed successfully',
        );
        if (paymentComplete) {
          return {
            status: 'Payment completed successfully',
          };
        }
      }
    } else {
      this.wsMessageGateway.sendNotification(orderId, 'Payment cancel');
      throw new ForbiddenException('Unauthorized or canceled payment');
    }
  }

  private async verifyWebhook(
    header: HeadersMP,
    query: QueryParamsMP,
  ): Promise<boolean> {
    let ts;
    let hash;

    const xSignature = header['x-signature'];
    const xRequestId = header['x-request-id'];

    const dataID = query['data.id'];

    const parts = xSignature.split(',');

    parts.forEach((part) => {
      const [key, value] = part.split('=');
      if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();

        if (trimmedKey === 'ts') {
          ts = trimmedValue;
        } else if (trimmedKey === 'v1') {
          hash = trimmedValue;
        }
      }
    });

    const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

    const hmac = crypto.createHmac('sha256', this.SECRET_WEBHOOK);
    hmac.update(manifest);

    const sha = hmac.digest('hex');

    if (sha === hash) {
      console.log('HMAC verification passed');
      return true;
    } else {
      console.log('HMAC verification failed');
      throw new BadRequestException('HMAC verification failed');
    }
  }

  private paymentValidation(
    payment: PaymentResponse,
  ): StatusPayment | undefined {
    const validStatuses = ['pending', 'approved', 'in_process', 'authorized'];

    if (validStatuses.includes(payment.status)) {
      return {
        status: payment.status,
        status_detail: payment.status_detail,
      };
    }

    return undefined;
  }
}
