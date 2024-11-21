import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/chat/entities/chat.entity';
import { GroupChat } from 'src/group-chat/entities/group-chat.entity';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(GroupChat)
    private readonly groupChatRepository: Repository<GroupChat>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async deleteExpiredHiddenChats(): Promise<void> {
    const now = new Date();
    console.log(`Checking for expired chats at ${now}`);

    const currentUTC = new Date(
      now.getTime() + now.getTimezoneOffset() * 60000,
    );

    const expiredChats = await this.chatRepository.find({
      where: {
        expiredAt: LessThan(currentUTC),
        is_active: true,
      },
    });

    this.logger.log(`Found ${expiredChats.length} expired chats`);

    if (expiredChats.length > 0) {
      for (const chat of expiredChats) {
        chat.is_active = false;
        await this.chatRepository.save(chat);
        this.logger.log(`Deactivated chat with id: ${chat.id}`);
      }
    }

    const expiredGroupChats = await this.groupChatRepository.find({
      where: {
        expiredAt: LessThan(currentUTC),
        is_active: true,
      },
    });

    this.logger.log(`Found ${expiredGroupChats.length} expired group chats`);

    if (expiredGroupChats.length > 0) {
      for (const groupChat of expiredGroupChats) {
        groupChat.is_active = false;
        await this.groupChatRepository.save(groupChat);
        this.logger.log(`Deactivated group chat with id: ${groupChat.id}`);
      }
    }
  }
}
