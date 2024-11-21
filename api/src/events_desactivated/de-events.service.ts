import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity';
import { FileEvent } from 'src/events/entities/file.event.entity';

@Injectable()
export class deEventsService {
  private readonly logger = new Logger(deEventsService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(FileEvent)
    private readonly fileEventRepository: Repository<FileEvent>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async deactivateExpiredEvents() {
    const now = new Date();
    console.log(`Checking for expired events at ${now}`);

    const currentUTC = new Date(
      now.getTime() + now.getTimezoneOffset() * 60000,
    );

    const expiredEvents = await this.eventRepository.find({
      where: {
        is_active: true,
        end_date: LessThan(currentUTC),
      },
      relations: ['file'],
    });

    this.logger.log(`Found ${expiredEvents.length} expired events`);

    for (const event of expiredEvents) {
      event.is_active = false;

      if (event.file) {
        event.file.is_active = false;
        await this.fileEventRepository.save(event.file);
        this.logger.log(`Deactivated file event with id: ${event.file.id}`);
      }

      await this.eventRepository.save(event);
      this.logger.log(`Deactivated event with id: ${event.id}`);
    }
  }
}
