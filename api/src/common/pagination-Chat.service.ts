import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationDto } from './dto/pagination.dto';
import { Message } from 'src/chat/entities/messages.entity';

@Injectable()
export class PaginationChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async paginateMessages(
    chatId: string,
    paginationDto: PaginationDto,
    findOptions: FindManyOptions<Message> = {},
  ): Promise<{
    messages: Message[];
    meta: { lastPage: number; currentPage: number; totalItems: number };
  }> {
    const { page = 1, limit = 10 } = paginationDto;

    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    const offset = (pageNumber - 1) * limitNumber;

    let totalItems: number;
    let messages: Message[];

    try {
      totalItems = await this.messageRepository.count({
        where: { chat: { id: chatId }, is_active: true },
      });

      messages = await this.messageRepository.find({
        where: { chat: { id: chatId }, is_active: true },
        order: { created_at: 'DESC' },
        take: limitNumber,
        skip: offset,
        relations: ['sender', 'receiver'],
        ...findOptions,
      });

      const lastPage = Math.ceil(totalItems / limitNumber);

      if (pageNumber > lastPage) {
        throw new NotFoundException('No more messages found for this page.');
      }

      const orderedMessages = messages.reverse();

      return {
        messages: orderedMessages,
        meta: {
          lastPage,
          currentPage: pageNumber,
          totalItems,
        },
      };
    } catch (error) {
      console.error('Pagination error:', error);
      throw new NotFoundException('Error retrieving messages.');
    }
  }
}
