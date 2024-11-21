import { Module } from '@nestjs/common';
import { WsMessageGateway } from './ws-message.gateway';

@Module({
  providers: [WsMessageGateway],
  exports: [WsMessageGateway],
})
export class WsMessageModule {}
