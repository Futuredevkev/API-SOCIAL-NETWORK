import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { PostImageUploadStrategy } from './strategy/post-image-strategy';
import { UserImageUploadStrategy } from './strategy/user-image-strategy';
import { CommentImageUploadStrategy } from './strategy/comment-image-strategy';
import { ResponsesImageUploadStrategy } from './strategy/responses-image-strategy';
import { EventImageUploadStrategy } from './strategy/event-image-strategy';
import { GroupExpandImageUploadStrategy } from './strategy/group-expand-image-strategy';
import { MessageImageUploadStrategy } from './strategy/message-image-strategy copy';
import { MessageVideoUploadStrategy } from './strategy/message-videoUpload-strategy';
import { MessageAudioUploadStrategy } from './strategy/message-audioUpload-strategy';
import { IAImageStrategy } from './strategy/ia-image-strategy';


@Module({
  providers: [
    UserImageUploadStrategy,
    PostImageUploadStrategy,
    CommentImageUploadStrategy,
    ResponsesImageUploadStrategy,
    EventImageUploadStrategy,
    GroupExpandImageUploadStrategy,
    MessageImageUploadStrategy,
    MessageVideoUploadStrategy,
    MessageAudioUploadStrategy,
    CloudinaryService,
    CloudinaryProvider,
    IAImageStrategy,
  ],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
