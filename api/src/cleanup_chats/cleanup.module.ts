import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup-service';
import { GroupChat } from 'src/group-chat/entities/group-chat.entity';
import { Chat } from 'src/chat/entities/chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, GroupChat]),
    ScheduleModule.forRoot(),
  ],
  providers: [
      CleanupService
  ],
  exports: [CleanupService],
})
export class CleanUpModule {}
