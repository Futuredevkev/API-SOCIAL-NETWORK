import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { StatusPay } from 'src/enums/enum-status-pay';

@Injectable()
export class MailsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendForgotPassword({
    mailUser,
    token,
  }: {
    mailUser: string;
    token: string;
  }): Promise<void> {
    if (mailUser.endsWith('@example.com') || mailUser.endsWith('@test.com')) {
      throw new Error('Invalid recipient address');
    } else
      (error) => {
        console.log(error);
      };

    const resetLink = `${process.env.HOST_FRONT}/auth/reset-password/${token}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f3f3f3;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              max-width: 600px;
              text-align: center;
            }
            .logo {
              max-width: 100px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 24px;
              color: #333;
            }
            p {
              font-size: 16px;
              color: #666;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #007BFF;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #0056b3;
            }
            .footer {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Recuperación de Contraseña</h1>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
            <div class="footer">
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>©${new Date().getFullYear()} Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: mailUser,
      subject: 'Recuperación de contraseña',
      html: htmlContent,
    });
  }

  async sendChangesConfirmation({
    mail,
    token,
  }: {
    mail: string;
    token: string;
  }): Promise<void> {
    const confirmationLink = `${process.env.HOST_FRONT}/auth/send-changes-confirmation/${token}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f3f3f3;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              max-width: 600px;
              text-align: center;
            }
            h1 {
              font-size: 24px;
              color: #333;
            }
            p {
              font-size: 16px;
              color: #666;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #007BFF;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #0056b3;
            }
            .footer {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Confirmación de Cambios</h1>
            <p>Haz clic en el siguiente enlace para confirmar los cambios en tu cuenta:</p>
            <a href="${confirmationLink}" class="button">Confirmar Cambios</a>
            <p>Si no solicitaste estos cambios, puedes ignorar este correo electrónico.</p>
            <div class="footer">
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>©${new Date().getFullYear()} Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: mail,
      subject: 'Confirmación de Cuenta',
      html: htmlContent,
    });
  }

  async recoveryUser({ mail, token }: { mail: string; token: string }) {
    const recoveryLink = `${process.env.HOST_FRONT}/auth/recovery/${token}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f3f3f3;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              max-width: 600px;
              text-align: center;
            }
            h1 {
              font-size: 24px;
              color: #333;
            }
            p {
              font-size: 16px;
              color: #666;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #007BFF;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #0056b3;
            }
            .footer {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Restauracion de Cuenta</h1>
            <p>Haz clic en el siguiente enlace para recuperar tu cuenta:</p>
            <a href="${recoveryLink}" class="button">Recuperar Cuenta</a>
            <p>Si no solicitaste recuperar tu cuenta, puedes ignorar este correo electrónico.</p>
            <div class="footer">
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>©${new Date().getFullYear()} Todos los derechos reservados.</p>
            </div>

          </div>
        </body>
      </html>
    `;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: mail,
      subject: 'Restaurar mi cuenta',
      html: htmlContent,
    });
  }

  async sendVerificationEmail({
    mailUser,
    token,
  }: {
    mailUser: string;
    token: string;
  }): Promise<void> {
    const verificationLink = `${process.env.HOST_FRONT}/auth/verify-email/${token}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f3f3f3;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              max-width: 600px;
              text-align: center;
            }
            h1 {
              font-size: 24px;
              color: #333;
            }
            p {
              font-size: 16px;
              color: #666;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #007BFF;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #0056b3;
            }
            .footer {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verifica tu Correo</h1>
            <p>Haz clic en el siguiente enlace para verificar tu correo electrónico y activar tu cuenta:</p>
            <a href="${verificationLink}" class="button">Verificar Correo</a>
            <p>Si no creaste una cuenta, puedes ignorar este correo electrónico.</p>
            <div class="footer">
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>©${new Date().getFullYear()} Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: mailUser,
      subject: 'Verifica tu Correo Electrónico',
      html: htmlContent,
    });
  }

  async sendOrderDetail({
    mailUser,
    orderId,
    amount,
    description,
    status,
  }: {
    mailUser: string;
    orderId: string;
    amount: number;
    description: string;
    status: StatusPay;
  }): Promise<void> {
    const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f3f3f3;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            text-align: center;
          }
          h1 {
            font-size: 24px;
            color: #333;
          }
          p {
            font-size: 16px;
            color: #666;
            line-height: 1.5;
          }
          .footer {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Detalles de tu Orden</h1>
          <p>Gracias por tu compra. Aquí tienes los detalles de tu orden:</p>
          <p><strong>ID de la Orden:</strong> ${orderId}</p>
          <p><strong>Monto:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Descripción:</strong> ${description}</p>
          <p><strong>Estado:</strong> ${status}</p>
          <div class="footer">
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>©${new Date().getFullYear()} Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    await this.mailerService.sendMail({
      from: process.env.MAIL_FROM,
      to: mailUser,
      subject: 'Detalles de tu Orden',
      html: htmlContent,
    });
  }
}
