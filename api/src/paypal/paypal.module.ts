import { Module, forwardRef } from '@nestjs/common';
import { PaymentsModule } from 'src/payments/payments.module';

import { WsMessageModule } from 'src/ws-message/ws-message.module';
import { PaypalService } from './paypal.service';
import { PaypalProvider } from './paypal.provider';
import { PaypalTransactionController } from './paypal.transaction.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { PaypalWebhookController } from './paypal.webhook.controller';
import { PaypalWebhookService } from './paypal.webhook';
import { MailsService } from 'src/mail/mail.service';

@Module({
  providers: [
    PaypalService,
    PaypalProvider,
    PaypalWebhookService,
    MailsService,
  ],
  exports: [PaypalService],
  imports: [forwardRef(() => PaymentsModule), WsMessageModule, OrdersModule],
  controllers: [PaypalWebhookController, PaypalTransactionController],
})
export class PaypalModule {}
