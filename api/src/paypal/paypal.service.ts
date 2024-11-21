import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PaypalProvider } from './paypal.provider';

@Injectable()
export class PaypalService {
  constructor(private readonly paypalProvider: PaypalProvider) {}

  public async getAccessToken(): Promise<string> {
    const clientId = this.paypalProvider.getClientId();
    const secret = this.paypalProvider.getSecret();

    try {
      const response = await axios.post(
        `${process.env.API_URL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          auth: {
            username: clientId,
            password: secret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error(
        'Error al obtener el token de acceso:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'No se pudo obtener el token de acceso.',
      );
    }
  }

  async createPayment(
    amount: number,
    orderId: string,
  ): Promise<{ id: string; approvalUrl: string }> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${process.env.API_URL}/v1/payments/payment`,
        {
          intent: 'sale',
          payer: { payment_method: 'paypal' },
          transactions: [
            {
              amount: { total: amount.toFixed(2), currency: 'USD' },
              description: 'Creación de comunidad en la app de reciclaje',
              invoice_number: orderId,
            },
          ],
          redirect_urls: {
            return_url: `https://4d0a-2800-a4-1b30-3800-e9e4-3320-1523-2c8.ngrok-free.app/api/v1/payment/transaction/${orderId}/successPaypal`,
            cancel_url: `https://4d0a-2800-a4-1b30-3800-e9e4-3320-1523-2c8.ngrok-free.app/api/v1/payment/transaction/${orderId}/cancelPaymentPaypal`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const paymentId = response.data.id;
      const approvalUrl = response.data.links.find(
        (link) => link.rel === 'approval_url',
      ).href;

      return {
        id: paymentId,
        approvalUrl: approvalUrl,
      };
    } catch (error) {
      console.error(
        'Error al crear el pago:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('No se pudo crear el pago.');
    }
  }

  async executePayment(paymentId: string, payerId: string): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    console.log('Access Token para ejecutar pago:', accessToken);

    try {
      const response = await axios.post(
        `${process.env.API_URL}/v1/payments/payment/${paymentId}/execute`,
        { payer_id: payerId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Respuesta de ejecutar pago:', response.data);
      return response.data.state === 'approved';
    } catch (error) {
      console.error(
        'Error al ejecutar el pago:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('No se pudo ejecutar el pago.');
    }
  }
}
