import { MercadoPagoConfig, Payment } from 'mercadopago';
import { v4 as uuid } from 'uuid';

export const MercadopagoProvider = {
  provide: 'MERCADO_PAGO',
  useFactory: () => {
    const client = new MercadoPagoConfig({
      accessToken: process.env.ACCESS_TOKEN_MP,
      options: { timeout: 5000, idempotencyKey: uuid() },
    });

    return new Payment(client);
  },
};
