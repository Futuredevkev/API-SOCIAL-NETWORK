import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(8084, { cors: true, origin: '*' })
export class StreamGateway {
  @WebSocketServer() server: Server;

 
  @SubscribeMessage('start_stream')
  handleStartStream(@MessageBody() streamData: any): void {
    console.log('Stream started:', streamData);
    this.server.emit('stream_started', streamData);
  }

 
  @SubscribeMessage('finish_stream')
  handleFinishStream(@MessageBody() streamData: any): void {
    console.log('Stream finished:', streamData);
    this.server.emit('stream_finished', streamData); 
  }
}
