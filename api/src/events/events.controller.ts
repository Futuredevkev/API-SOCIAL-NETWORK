import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Auth(Roles.ADMIN, Roles.USER)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create/:communityId')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createEventDto: CreateEventDto,
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.eventsService.createEvent(
      userId,
      communityId,
      createEventDto,
      image,
    );
  }

  @Get('findACE/:communityId')
  findACE(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.eventsService.findAllCommunityEvents(
      userId,
      communityId,
      paginationDto,
    );
  }

  @Get('findDCE/:communityId')
  findDCE(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.eventsService.findDesactivatedCommunityEvents(
      userId,
      communityId,
      paginationDto,
    );
  }

  @Patch('update/:communityId/:eventId')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Param('eventId') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.eventsService.updateEvent(
      userId,
      communityId,
      eventId,
      image,
      updateEventDto,
    );
  }

  @Delete(':communityId/:eventId')
  async remove(
    @GetUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Param('communityId') communityId: string,
  ) {
    return this.eventsService.removeEvent(userId, communityId, eventId);
  }
}
