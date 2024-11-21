import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, type Socket } from 'socket.io';

@WebSocketGateway(8081, { cors: true })
export class WsMessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly client: Map<string, Socket> = new Map<string, Socket>();

  handleConnection(client: Socket): void {
    const orderId = client.handshake.query.orderId as string;
    if (orderId) {
      this.client.set(orderId, client);
    }
    console.log('conectado');
  }

  handleDisconnect(client: Socket): void {
    const orderId = client.handshake.query.orderId as string;
    if (orderId) {
      this.client.delete(orderId);
    }
    console.log('desconectado');
  }

  sendNotification(orderId: string, message: string): void {
    const client = this.client.get(orderId);
    if (client) {
      client.emit('notification', message);
    }
  }
}
