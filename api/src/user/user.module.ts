import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { File } from './entities/files.entity';
import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Address } from 'src/address/entities/address.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailsModule } from 'src/mail/mail.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserImageUploadStrategy } from 'src/cloudinary/strategy/user-image-strategy';
import { PostImageUploadStrategy } from 'src/cloudinary/strategy/post-image-strategy';
import { Block } from './entities/block.entity';
import { Report } from './entities/report.entity';
import { CommentImageUploadStrategy } from 'src/cloudinary/strategy/comment-image-strategy';
import { ResponsesImageUploadStrategy } from 'src/cloudinary/strategy/responses-image-strategy';
import { GroupExpandImageUploadStrategy } from 'src/cloudinary/strategy/group-expand-image-strategy';
import { EventImageUploadStrategy } from 'src/cloudinary/strategy/event-image-strategy';
import { MessageVideoUploadStrategy } from 'src/cloudinary/strategy/message-videoUpload-strategy';
import { MessageImageUploadStrategy } from 'src/cloudinary/strategy/message-image-strategy copy';
import { MessageAudioUploadStrategy } from 'src/cloudinary/strategy/message-audioUpload-strategy';
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';
import { FavUser } from './entities/fav_user.entity';
import { StreamImagePreviewStrategy } from 'src/cloudinary/strategy/stream-image-preview-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      File,
      Address,
      Block,
      Report,
      FavUser,
    ]),
    CloudinaryModule,
    MailsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PaginationService,
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
  exports: [UserService],
})
export class UserModule {}
