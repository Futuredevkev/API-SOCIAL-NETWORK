import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from './entities/stream.entity';
import { User } from 'src/user/entities/user.entity';
import { StreamGateway } from 'src/ws-stream/ws-stream.gateway';
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
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';
import { StreamImagePreviewStrategy } from 'src/cloudinary/strategy/stream-image-preview-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Stream, User])],
  controllers: [StreamController],
  providers: [
    StreamService,
    StreamGateway,
    CloudinaryService,
    PostImageUploadStrategy,
    UserImageUploadStrategy,
    CommentImageUploadStrategy,
    ResponsesImageUploadStrategy,
    GroupExpandImageUploadStrategy,
    EventImageUploadStrategy,
    MessageVideoUploadStrategy,
    MessageImageUploadStrategy,
    MessageAudioUploadStrategy,
    IAImageStrategy,
    StreamImagePreviewStrategy,
  ],
})
export class StreamModule {}
