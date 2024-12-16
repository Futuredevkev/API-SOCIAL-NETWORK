import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { PaypalService } from 'src/paypal/paypal.service';
import { MercadoPagoService } from 'src/mercadopago/mercadopago.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { MethodPays } from 'src/enums/enum-method-pay';
import { StatusPay } from 'src/enums/enum-status-pay';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly ordersService: OrdersService,
    private readonly paypalService: PaypalService,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async createPayment(userId: string, createOrderDto: CreateOrderDto) {
    const { method, email } = createOrderDto;

    const amount = 8;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasApprovedOrder =
      await this.ordersService.hasRecentApprovedOrder(userId);

    if (hasApprovedOrder) {
      throw new InternalServerErrorException('Ya has pagado la comunidad');
    }

    const description = `Estimado/a ${user.name}, agradecemos sinceramente tu valioso aporte, esperamos que puedas crear una hermosa comunidad de reciclaje, para ayudar al mundo y a la naturaleza.`;
    const status = StatusPay.PENDING;

    const order = await this.ordersService.createOrder(userId, {
      description,
      email,
      amount,
      status,
      method,
    });

    let paymentId: string;
    let approvalUrl: string;

    if (method === MethodPays.PAYPAL) {
      try {
        const paymentDetails = await this.paypalService.createPayment(
          amount,
          order.id,
        );
        paymentId = paymentDetails.id;
        approvalUrl = paymentDetails.approvalUrl;
      } catch (error) {
        await this.handlePaymentError(order, StatusPay.FAILED);
        throw new InternalServerErrorException('Error al procesar el pago.');
      }
    } else if (method === MethodPays.MERCADOPAGO) {
      try {
        const paymentDetails = await this.mercadoPagoService.createPayment(
          createOrderDto,
          { id: order.id },
        );
        paymentId = paymentDetails.id;
      } catch (error) {
        await this.handlePaymentError(order, StatusPay.FAILED);
        console.log(error);
        throw new InternalServerErrorException('Error al procesar el pago.');
      }
    } else {
      await this.handlePaymentError(order, StatusPay.REJECTED);
      throw new Error('Método de pago no soportado');
    }

    await this.ordersService.updateOrderPaymentId(order.id, paymentId);
    await this.ordersService.updateOrderStatus(order.id, StatusPay.PENDING);

    return { paymentId, orderId: order.id, approvalUrl };
  }

  async registerPayment(orderId: string, body: any, userId?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let status: StatusPay;

    const isPaymentApproved =
      body.event_type === 'CHECKOUT.ORDER.APPROVED' ||
      body.event_type === 'CHECKOUT.ORDER.COMPLETED' ||
      (body.event_type === 'PAYMENTS.PAYMENT.CREATED' &&
        body.resource?.state === 'approved');

    if (isPaymentApproved) {
      status = StatusPay.APPROVED;

     
      const hasApprovedOrder =
        await this.ordersService.hasRecentApprovedOrder(userId);

      if (!hasApprovedOrder) {
        user.is_payed = true;
        await this.userRepository.save(user);
      }
    } else if (body.event_type === 'CHECKOUT.PAYMENT-APPROVAL.REVERSED') {
      status = StatusPay.REJECTED;
    } else {
      status = StatusPay.PENDING;
    }

    try {
      await this.ordersService.updateOrderStatus(orderId, status);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  private async handlePaymentError(order: any, status: StatusPay) {
    await this.ordersService.updateOrderPaymentId(order.id, null);
    await this.ordersService.updateOrderStatus(order.id, status);
  }
}
