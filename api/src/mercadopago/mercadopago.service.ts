import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Payment } from 'mercadopago';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';

@Injectable()
export class MercadoPagoService {
  constructor(@Inject('MERCADO_PAGO') private readonly payment: Payment) {}

  async createPayment(
    createOrderDto: CreateOrderDto,
    order: any,
  ): Promise<any> {
    const { token, email, method, amount, description } = createOrderDto;
    try {
      const paymentData = {
        body: {
          token,
          transaction_amount: amount,
          payer: {
            email,
          },
          description,
          payment_method_id: method,
          notification_url: process.env.NOTIFICATION_URL,
          metadata: { id_order: order.id },
        },
      };

      const paymentResponse = await this.payment.create(paymentData);
      return paymentResponse;
    } catch (error) {
      console.error('Error al crear el pedido en Mercado Pago:', error);
      throw new InternalServerErrorException('Error al procesar el pago.');
    }
  }
}
