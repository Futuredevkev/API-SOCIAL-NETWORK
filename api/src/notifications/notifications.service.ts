import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { NotificationType } from 'src/enums/enum-notifications-type';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createNotification(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
    relatedEntityId: string,
  ) {
    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!recipient || !sender) {
      throw new Error('User not found');
    }

    const notification = this.notificationRepository.create({
      recipient,
      sender,
      type,
      message,
      relatedEntityId,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.notificationRepository.update(notificationId, { isRead: true });
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      where: {
        recipient: { id: userId },
        isRead: false,
      },
      relations: ['sender'],
      order: { created_at: 'DESC' },
    });
  }
}
