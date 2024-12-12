import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { UploadStrategy } from './interface/upload-strategy';

import { UserImageUploadStrategy } from './strategy/user-image-strategy';
import { PostImageUploadStrategy } from './strategy/post-image-strategy';
import { CommentImageUploadStrategy } from './strategy/comment-image-strategy';
import { ResponsesImageUploadStrategy } from './strategy/responses-image-strategy';
import { EventImageUploadStrategy } from './strategy/event-image-strategy';
import { GroupExpandImageUploadStrategy } from './strategy/group-expand-image-strategy';
import { MessageImageUploadStrategy } from './strategy/message-image-strategy copy';
import { MessageVideoUploadStrategy } from './strategy/message-videoUpload-strategy';
import { MessageAudioUploadStrategy } from './strategy/message-audioUpload-strategy';
import { IAImageStrategy } from './strategy/ia-image-strategy';
import { VerificationUserStrategy } from './strategy/verification-user-strategy';
import { StreamImagePreviewStrategy } from './strategy/stream-image-preview-strategy';

type StrategyType =
  | 'user'
  | 'post'
  | 'comment'
  | 'responses'
  | 'event'
  | 'groupExpand'
  | 'messageFiles'
  | 'video-message'
  | 'audio-message'
  | 'ia-upload'
  | 'verification-user'
  | 'stream-image-preview';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly userimageUploadStrategy: UserImageUploadStrategy,
    private readonly postimageUploadStrategy: PostImageUploadStrategy,
    private readonly commentimageUploadStrategy: CommentImageUploadStrategy,
    private readonly responsesimageUploadStrategy: ResponsesImageUploadStrategy,
    private readonly eventimageUploadStrategy: EventImageUploadStrategy,
    private readonly groupExpandimageUploadStrategy: GroupExpandImageUploadStrategy,
    private readonly messageFilesUploadStrategy: MessageImageUploadStrategy,
    private readonly messageVideoUploadStrategy: MessageVideoUploadStrategy,
    private readonly messageAudioUploadStrategy: MessageAudioUploadStrategy,
    private readonly verificationUserUploadStrategy: VerificationUserStrategy,
    private readonly streamImageUploadStrategy: StreamImagePreviewStrategy,
    private readonly iaUploadStrategy: IAImageStrategy,
  ) {}

  async uploadFile(
    file: Buffer,
    type: StrategyType,
  ): Promise<CloudinaryResponse> {
    let strategy: UploadStrategy;

    switch (type) {
      case 'user':
        strategy = this.userimageUploadStrategy;
        break;
      case 'post':
        strategy = this.postimageUploadStrategy;
        break;
      case 'comment':
        strategy = this.commentimageUploadStrategy;
        break;
      case 'responses':
        strategy = this.responsesimageUploadStrategy;
        break;
      case 'event':
        strategy = this.eventimageUploadStrategy;
        break;
      case 'groupExpand':
        strategy = this.groupExpandimageUploadStrategy;
        break;
      case 'messageFiles':
        strategy = this.messageFilesUploadStrategy;
        break;
      case 'video-message':
        strategy = this.messageVideoUploadStrategy;
        break;
      case 'audio-message':
        strategy = this.messageAudioUploadStrategy;
        break;
      case 'ia-upload':
        strategy = this.iaUploadStrategy;
        break;
      case 'verification-user':
        strategy = this.verificationUserUploadStrategy;
        break;
      case 'stream-image-preview':
        strategy = this.streamImageUploadStrategy;
        break;
      default:
        throw new BadRequestException('Invalid upload type');
    }

    return await strategy.upload(file);
  }
}
