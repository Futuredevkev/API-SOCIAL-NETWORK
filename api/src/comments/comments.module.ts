import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Publication } from 'src/publication/entities/publication.entity';
import { User } from 'src/user/entities/user.entity';
import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PostImageUploadStrategy } from 'src/cloudinary/strategy/post-image-strategy';
import { UserImageUploadStrategy } from 'src/cloudinary/strategy/user-image-strategy';
import { CommentImageUploadStrategy } from 'src/cloudinary/strategy/comment-image-strategy';
import { ResponsesImageUploadStrategy } from 'src/cloudinary/strategy/responses-image-strategy';
import { FileComment } from './entities/file-comment.entity';
import { GroupExpandImageUploadStrategy } from 'src/cloudinary/strategy/group-expand-image-strategy';
import { EventImageUploadStrategy } from 'src/cloudinary/strategy/event-image-strategy';
import { MessageVideoUploadStrategy } from 'src/cloudinary/strategy/message-videoUpload-strategy';
import { MessageImageUploadStrategy } from 'src/cloudinary/strategy/message-image-strategy copy';
import { MessageAudioUploadStrategy } from 'src/cloudinary/strategy/message-audioUpload-strategy';
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Publication, User, FileComment]), 
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
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
  ],
})
export class CommentsModule {}
