import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { PaypalService } from 'src/paypal/paypal.service';
import { MailsService } from 'src/mail/mail.service';
import { OrdersModule } from 'src/orders/orders.module';
import { MercadopagoModule } from 'src/mercadopago/mercadopago.module';
import { PaypalModule } from 'src/paypal/paypal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    OrdersModule,
    MercadopagoModule,
    PaypalModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MailsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
