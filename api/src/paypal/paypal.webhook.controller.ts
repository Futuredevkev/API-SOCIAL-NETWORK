import {
  Controller,
  Post,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaypalWebhookService } from './paypal.webhook';
import { PaypalWebhookBody } from 'src/types/type.verification-webhook';

@Controller('paypal-webhook')
export class PaypalWebhookController {
  constructor(private readonly paypalWebhookService: PaypalWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers() headers: Record<string, string>,
    @Body() body: PaypalWebhookBody,
  ): Promise<{ status: string }> {
    try {
      return await this.paypalWebhookService.handleWebhook(headers, body);
    } catch (error) {
      console.error('Error handling PayPal webhook:', error.message);
      throw new InternalServerErrorException('Check log server');
    }
  }
}
