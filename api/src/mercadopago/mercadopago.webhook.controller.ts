import { Body, Controller, Headers, Post, Query } from '@nestjs/common';
import { MercadopagoWebhookService } from './mercadopago.webhook.service';
import {
  BodyWebhookMP,
  HeadersMP,
  QueryParamsMP,
} from 'src/types/type.verification-webhook';

@Controller('mercadopago')
export class MercadopagoWebhookController {
  constructor(
    private readonly mercadopagoWebhookService: MercadopagoWebhookService,
  ) {}

  @Post('webhook-mp')
  async handleWebhook(
    @Query() querys: QueryParamsMP,
    @Body() body: BodyWebhookMP,
    @Headers() headers: HeadersMP,
  ): Promise<{ status: string }> {
    return await this.mercadopagoWebhookService.handleWebhook(
      headers,
      body,
      querys,
    );
  }
}
