import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { User } from 'src/user/entities/user.entity';
import { Community } from 'src/comunities/entities/comunity.entity';
import { FileEvent } from './entities/file.event.entity';
import { PaginationService } from 'src/common/pagination.service';
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
import { ScheduleModule } from '@nestjs/schedule';
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';
import { VerificationUserStrategy } from 'src/cloudinary/strategy/verification-user-strategy';
import { StreamImagePreviewStrategy } from 'src/cloudinary/strategy/stream-image-preview-strategy';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Event, User, Community, FileEvent]),
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    PaginationService,
    CloudinaryService,
    PostImageUploadStrategy,
    UserImageUploadStrategy,
    CommentImageUploadStrategy,
    ResponsesImageUploadStrategy,
    GroupExpandImageUploadStrategy,
    EventImageUploadStrategy,
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
    VerificationUserStrategy,
    StreamImagePreviewStrategy,
  ],
})
export class EventsModule {}
