import {
  Controller,
  Get,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Controller('payment/transaction')
export class PaypalTransactionController {
  constructor(
    private readonly paypalService: PaypalService,
  ) {}

  @Get(':orderId/successPaypal')
  async handleSuccess(
    @Query('paymentId') paymentId: string,
    @Query('PayerID') payerId: string,
    @Query('orderId') orderId: string,
  ) {
    try {
      const isVerified = await this.paypalService.executePayment(
        paymentId,
        payerId,
      );
      if (isVerified) {
        return { message: 'Pago verificado y exitoso.', orderId };
      } else {
        return { message: 'Pago no verificado.', orderId };
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al verificar el pago.');
    }
  }

  @Get('cancelPaymentPaypal')
  paymentCancelled(@Query('orderId') orderId: string) {
    return { message: 'Pago cancelado.', orderId };
  }
}
