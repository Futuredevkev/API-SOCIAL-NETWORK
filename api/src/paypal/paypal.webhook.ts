import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { PaymentsService } from '../payments/payments.service';
import { WsMessageGateway } from '../ws-message/ws-message.gateway';
import { PaypalWebhookBody } from 'src/types/type.verification-webhook';
import { OrdersService } from 'src/orders/orders.service';
import { StatusPay } from 'src/enums/enum-status-pay';
import { MailsService } from 'src/mail/mail.service';

@Injectable()
export class PaypalWebhookService {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly wsMessageGateway: WsMessageGateway,
    private readonly orderService: OrdersService,
    private readonly mailService: MailsService,
  ) {}

  private readonly API_BASE_URL: string = process.env.API_URL;
  private readonly CLIENT_ID: string = process.env.PAYPAL_CLIENT_ID;
  private readonly SECRET: string = process.env.PAYPAL_SECRET;
  private readonly PAYPAL_WEBHOOK_MESSAGE_ID: string =
    process.env.PAYPAL_WEBHOOK_MESSAGE_ID;

  async handleWebhook(
    headers: Record<string, string>,
    body: PaypalWebhookBody,
  ): Promise<{ status: string }> {
    if (!body || !body.resource || !body.resource.id) {
      console.error('Invalid webhook body:', JSON.stringify(body));
      throw new BadRequestException('Invalid webhook format');
    }

    let orderId: string | undefined;
    if (
      Array.isArray(body.resource.transactions) &&
      body.resource.transactions.length > 0
    ) {
      orderId = body.resource.transactions[0].invoice_number;
    } else {
      orderId = body.resource.invoice_number;
    }

    if (!orderId) {
      throw new BadRequestException('No Order ID found');
    }

    const validate = await this.validateWebHook(headers, body);

    if (validate) {
      let status: StatusPay;
      if (
        body.event_type === 'CHECKOUT.ORDER.APPROVED' ||
        body.event_type === 'CHECKOUT.ORDER.COMPLETED' ||
        body.event_type === 'PAYMENTS.PAYMENT.CREATED'
      ) {
        status = StatusPay.APPROVED;
        await this.paymentService.registerPayment(orderId, body);

        const order = await this.orderService.findOne(orderId);

        try {
          await this.mailService.sendOrderDetail({
            mailUser: order.email,
            orderId: order.id,
            amount: Number(order.amount),
            description: order.description,
            status: StatusPay.APPROVED,
          });
        } catch (error) {
          console.error('Error sending email:', error);
        }

        this.wsMessageGateway.sendNotification(
          orderId,
          'Payment completed successfully',
        );
        return { status: 'Payment completed successfully' };
      } else if (body.event_type === 'CHECKOUT.PAYMENT-APPROVAL.REVERSED') {
        status = StatusPay.REJECTED;
        this.wsMessageGateway.sendNotification(orderId, 'Payment canceled');
        return { status: 'Payment canceled' };
      } else {
        status = StatusPay.PENDING;
        this.wsMessageGateway.sendNotification(orderId, 'Payment pending');
        return { status: 'Payment pending' };
      }
    } else {
      this.wsMessageGateway.sendNotification(orderId, 'Payment canceled');
      throw new BadRequestException('Something has gone wrong');
    }
  }

  private async validateWebHook(
    headers: Record<string, string>,
    body: any,
  ): Promise<boolean> {
    console.log('Validating webhook with headers:', headers);

    const {
      'paypal-transmission-id': transmissionId,
      'paypal-transmission-time': transmissionTime,
      'paypal-cert-url': certUrl,
      'paypal-transmission-sig': transmissionSig,
      'paypal-auth-algo': authAlgo,
    } = headers;

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !transmissionSig ||
      !authAlgo
    ) {
      console.error('Missing required PayPal webhook headers:', headers);
      throw new UnauthorizedException(
        'Missing required PayPal webhook headers',
      );
    }

    const verificationEndpoint = `${this.API_BASE_URL}/v1/notifications/verify-webhook-signature`;
    const requestBody = {
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: this.PAYPAL_WEBHOOK_MESSAGE_ID,
      webhook_event: body,
    };

    try {
      const access_token = await this.getAccessToken();

      const { data: verificationResult } = await axios.post(
        verificationEndpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      if (verificationResult.verification_status === 'SUCCESS') {
        console.log('PayPal webhook signature verified successfully.');
        return true;
      } else {
        console.error(
          'Failed to verify PayPal webhook signature:',
          verificationResult,
        );
        return false;
      }
    } catch (error) {
      console.error('Error verifying PayPal webhook:', error);
      throw new InternalServerErrorException('Error verifying PayPal webhook');
    }
  }
  private async getAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    try {
      const { data } = await axios.post(
        `${this.API_BASE_URL}/v1/oauth2/token`,
        params,
        {
          auth: {
            username: this.CLIENT_ID,
            password: this.SECRET,
          },
        },
      );

      const { access_token } = data;
      return access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new InternalServerErrorException('Error getting access token');
    }
  }
}
