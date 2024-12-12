import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Stream')
@Auth(Roles.ADMIN, Roles.USER)
@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', {}))
  createStream(
    @GetUser('id') userId: string,
    @Body() data: CreateStreamDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.streamService.createStream(userId, data, image);
  }

  @Get('activeStreams')
  getActiveStreams() {
    return this.streamService.getActiveStreams();
  }

  @Get('userStreams')
  getUserStreams(@GetUser('id') userId: string) {
    return this.streamService.getUserStreams(userId);
  }

  @Patch('update/:streamId')
  updateStream(
    @GetUser('id') userId: string,
    @Param('streamId') streamId: string,
    @Body() data: UpdateStreamDto,
  ) {
    return this.streamService.editStream(userId, data, streamId);
  }

  @Patch('validate/:streamKey')
  validateStream(
    @GetUser('id') userId: string,
    @Param('streamKey') streamKey: string,
  ) {
    return this.streamService.validateStreamKey(userId, streamKey);
  }

  @Patch('finish/:streamKey')
  finishStream(
    @GetUser('id') userId: string,
    @Param('streamKey') streamKey: string,
  ) {
    return this.streamService.finishStream(userId, streamKey);
  }
}
