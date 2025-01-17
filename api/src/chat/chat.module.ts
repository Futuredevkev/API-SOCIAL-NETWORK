import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { Message } from './entities/messages.entity';
import { FileMessage } from './entities/fileMessage.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PostImageUploadStrategy } from 'src/cloudinary/strategy/post-image-strategy';
import { UserImageUploadStrategy } from 'src/cloudinary/strategy/user-image-strategy';
import { CommentImageUploadStrategy } from 'src/cloudinary/strategy/comment-image-strategy';
import { ResponsesImageUploadStrategy } from 'src/cloudinary/strategy/responses-image-strategy';
import { GroupExpandImageUploadStrategy } from 'src/cloudinary/strategy/group-expand-image-strategy';
import { EventImageUploadStrategy } from 'src/cloudinary/strategy/event-image-strategy';
import { MessageVideoUploadStrategy } from 'src/cloudinary/strategy/message-videoUpload-strategy';
import { MessageImageUploadStrategy } from 'src/cloudinary/strategy/message-image-strategy copy';
import { MessageAudioUploadStrategy } from 'src/cloudinary/strategy/message-audioUpload-strategy';
import { LikeMessage } from './entities/likeMessage.entity';
import { PaginationChatService } from 'src/common/pagination-Chat.service';
import { ScheduleModule } from '@nestjs/schedule';
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';
import { NotificationGateway } from 'src/ws-notifications/ws-notifications.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WsNotificationModule } from 'src/ws-notifications/ws-notification-module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User, Message, FileMessage, LikeMessage]),
    NotificationsModule,
    WsNotificationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    CloudinaryService,
    PostImageUploadStrategy,
    UserImageUploadStrategy,
    CommentImageUploadStrategy,
    PaginationChatService,
    ResponsesImageUploadStrategy,
    GroupExpandImageUploadStrategy,
    EventImageUploadStrategy,
    MessageVideoUploadStrategy,
    MessageImageUploadStrategy,
    MessageAudioUploadStrategy,
    IAImageStrategy,
    NotificationGateway,
  ],
  exports: [ChatService],
})
export class ChatModule {}
