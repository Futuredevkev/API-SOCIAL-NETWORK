import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule';
import { Event } from 'src/events/entities/event.entity';
import { FileEvent } from 'src/events/entities/file.event.entity';
import { deEventsService } from './de-events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, FileEvent]),
    ScheduleModule.forRoot(),
  ],
  providers: [deEventsService],
  exports: [deEventsService],
})
export class deEventsModule {}
