import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedLike } from './entities/needLike.entity';
import { ChangeLike } from './entities/changeLike.entity';
import { Publication } from 'src/publication/entities/publication.entity';
import { User } from 'src/user/entities/user.entity';
import { NotificationGateway } from 'src/ws-notifications/ws-notifications.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WsNotificationModule } from 'src/ws-notifications/ws-notification-module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NeedLike, ChangeLike, Publication, User]),
    NotificationsModule,
    WsNotificationModule,
  ],
  controllers: [LikeController],
  providers: [LikeService, NotificationGateway],
})
export class LikeModule {}
