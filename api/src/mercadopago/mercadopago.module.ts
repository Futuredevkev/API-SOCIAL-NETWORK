import { Module, forwardRef } from '@nestjs/common';
import { PaymentsModule } from 'src/payments/payments.module';
import { MercadoPagoService } from './mercadopago.service';
import { MercadopagoProvider } from './mercadopago.provider';
import { WsMessageModule } from 'src/ws-message/ws-message.module';
import { OrdersModule } from 'src/orders/orders.module';
import { MercadopagoWebhookService } from './mercadopago.webhook.service';
import { MercadopagoWebhookController } from './mercadopago.webhook.controller';

@Module({
  providers: [
    MercadoPagoService,
    MercadopagoProvider,
    MercadopagoWebhookService,
  ],
  exports: [MercadoPagoService, MercadopagoProvider],
  imports: [forwardRef(() => PaymentsModule), WsMessageModule, OrdersModule],
  controllers: [MercadopagoWebhookController],
})
export class MercadopagoModule {}
