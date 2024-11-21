import { Injectable } from '@nestjs/common';

@Injectable()
export class PaypalProvider {
  private readonly clientId: string;
  private readonly secret: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.secret = process.env.PAYPAL_SECRET;
  }

  getClientId(): string {
    return this.clientId;
  }

  getSecret(): string {
    return this.secret;
  }
}
