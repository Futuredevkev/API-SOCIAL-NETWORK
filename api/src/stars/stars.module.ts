import { Module } from '@nestjs/common';
import { StarsService } from './stars.service';
import { StarsController } from './stars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Star } from './entities/star.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Star, User])],
  controllers: [StarsController],
  providers: [StarsService],
})
export class StarsModule {}
