import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FindManyOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T> | Repository<T>,
    paginationDto: PaginationDto,
    findOptions: FindManyOptions<T> = {},
  ): Promise<{
    data: T[];
    meta: { lastpage: number; offset: number; totalItems: number };
  }> {
    const { page = 1, limit = 10 } = paginationDto;

  
    const pageNumber = Math.max(1, page); 
    const limitNumber = Math.max(1, limit); 

    let offset = (pageNumber - 1) * limitNumber;
    let lastpage = 0;

    let totalItems: number;
    let data: T[];

    try {
      if (queryBuilder instanceof Repository) {
        totalItems = await queryBuilder.count();
        data = await queryBuilder.find({
          ...findOptions,
          take: limitNumber,
          skip: offset,
        });
      } else {
        totalItems = await queryBuilder.getCount();
        data = await queryBuilder.take(limitNumber).skip(offset).getMany();
      }

    
      lastpage = Math.ceil(totalItems / limitNumber);


      if (pageNumber > lastpage) {
        offset = (lastpage - 1) * limitNumber;

        if (queryBuilder instanceof Repository) {
          data = await queryBuilder.find({
            ...findOptions,
            take: limitNumber,
            skip: offset,
          });
        } else {
          data = await queryBuilder.take(limitNumber).skip(offset).getMany();
        }
      }

    
      if (data.length === 0) {
        throw new NotFoundException('Not found more items');
      }

      return {
        data,
        meta: {
          lastpage,
          offset,
          totalItems,
        },
      };
    } catch (error) {
      console.error('Pagination error:', error);
      throw error;
    }
  }
}
