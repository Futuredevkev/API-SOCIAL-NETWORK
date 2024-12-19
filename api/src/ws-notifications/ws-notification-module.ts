import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from 'src/config/typeorm';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationGateway } from './ws-notifications.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), NotificationsModule],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class WsNotificationModule {}
