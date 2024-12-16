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
            return_url: `https://eea2-2800-a4-1a16-e100-5149-a5cb-bcc6-a89a.ngrok-free.app/api/v1/payment/transaction/${orderId}/successPaypal`,
            cancel_url: `https://eea2-2800-a4-1a16-e100-5149-a5cb-bcc6-a89a.ngrok-free.app/api/v1/payment/transaction/${orderId}/cancelPaymentPaypal`,
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

      const isApproved =
        response.data.state === 'approved' ||
        (response.data.transactions &&
          response.data.transactions[0].related_resources[0].sale.state ===
            'completed');

      return isApproved;
    } catch (error) {
      console.error('Detalles completos del error:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      if (error.response?.data?.name === 'INVALID_RESOURCE_ID') {
        console.warn(
          'ID de recurso inválido, pero el pago puede estar procesado',
        );
        return true;
      }

      throw new InternalServerErrorException(
        'No se pudo ejecutar el pago: ' + error.message,
      );
    }
  }
}
