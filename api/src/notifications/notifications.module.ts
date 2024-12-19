import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
