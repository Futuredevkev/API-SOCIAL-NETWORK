import { Module } from '@nestjs/common';
import { ChatWsController } from 'src/chat/chat-socket.controller';
import { ChatGateway } from './ws-chat.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { GroupChatWsController } from 'src/group-chat/group-chat-socket.controller';
import { GroupChatModule } from 'src/group-chat/group-chat.module';

@Module({
  providers: [ChatGateway, ChatWsController, GroupChatWsController],
  imports: [ChatModule, GroupChatModule],
})
export class WsChatModule {}
