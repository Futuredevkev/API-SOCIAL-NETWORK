import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedLike } from './entities/needLike.entity';
import { ChangeLike } from './entities/changeLike.entity';
import { Publication } from 'src/publication/entities/publication.entity';
import { User } from 'src/user/entities/user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([NeedLike, ChangeLike, Publication, User])
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
