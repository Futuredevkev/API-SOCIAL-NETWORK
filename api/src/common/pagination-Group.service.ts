import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationDto } from './dto/pagination.dto';
import { GroupMessage } from 'src/group-chat/entities/group-message.entity';

@Injectable()
export class PaginationGroupChatService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly messageRepository: Repository<GroupMessage>,
  ) {}

  async paginateMessages(
    groupId: string,
    paginationDto: PaginationDto,
    findOptions: FindManyOptions<GroupMessage> = {},
  ): Promise<{
    messages: GroupMessage[];
    meta: { lastPage: number; currentPage: number; totalItems: number };
  }> {
    const { page = 1, limit = 10 } = paginationDto;

    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    const offset = (pageNumber - 1) * limitNumber;

    let totalItems: number;
    let messages: GroupMessage[];

    try {
      totalItems = await this.messageRepository.count({
        where: { group: { id: groupId }, is_active: true },
      });

      messages = await this.messageRepository.find({
        where: { group: { id: groupId }, is_active: true },
        order: { created_at: 'DESC' },
        take: limitNumber,
        skip: offset,
        relations: ['sender'],
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
