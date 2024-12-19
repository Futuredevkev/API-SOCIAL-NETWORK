import { Module } from '@nestjs/common';
import { GroupChatService } from './group-chat.service';
import { GroupChatController } from './group-chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupChat } from './entities/group-chat.entity';
import { GroupMessage } from './entities/group-message.entity';
import { User } from 'src/user/entities/user.entity';
import { FileGroup } from './entities/file-group.entity';
import { GroupUser } from './entities/group-user.entity';
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
import { PaginationGroupChatService } from 'src/common/pagination-Group.service';
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';
import { StreamImagePreviewStrategy } from 'src/cloudinary/strategy/stream-image-preview-strategy';
import { NotificationGateway } from 'src/ws-notifications/ws-notifications.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WsNotificationModule } from 'src/ws-notifications/ws-notification-module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupChat,
      GroupMessage,
      User,
      FileGroup,
      GroupUser,
    ]),
    NotificationsModule,
    WsNotificationModule,
  ],
  controllers: [GroupChatController],
  providers: [
    GroupChatService,
    CloudinaryService,
    PostImageUploadStrategy,
    UserImageUploadStrategy,
    PaginationGroupChatService,
    CommentImageUploadStrategy,
    ResponsesImageUploadStrategy,
    GroupExpandImageUploadStrategy,
    EventImageUploadStrategy,
    MessageVideoUploadStrategy,
    MessageImageUploadStrategy,
    MessageAudioUploadStrategy,
    IAImageStrategy,
    StreamImagePreviewStrategy,
    NotificationGateway,
  ],
  exports: [GroupChatService],
})
export class GroupChatModule {}
