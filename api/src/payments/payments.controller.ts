import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { PaypalService } from 'src/paypal/paypal.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('payments')
@Auth(Roles.ADMIN, Roles.USER)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PaypalService
  ) {}

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.createPayment(userId, createOrderDto);
  }

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
