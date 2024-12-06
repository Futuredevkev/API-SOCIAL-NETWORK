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
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('responses')
@Auth(Roles.ADMIN, Roles.USER)
@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post(':publicationId/:commentId')
  @UseInterceptors(FileInterceptor('image', {}))
  async create(
    @GetUser('id') userId: string,
    @Param('publicationId') publicationId: string,
    @Param('commentId') commentId: string,
    @Body() createResponseDto: CreateResponseDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.responsesService.createResponse(
      userId,
      publicationId,
      commentId,
      createResponseDto,
      image,
    );
  }

  @Get('find/findByUser')
  async findByUser(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.responsesService.findResponseByUser(userId, paginationDto);
  }

  @Get('find/findByComment/:commentId')
  async findByComment(
    @Param('commentId') commentId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.responsesService.findResponseByComment(
      commentId,
      paginationDto,
    );
  }

  @Get('find/all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.responsesService.findAll(paginationDto);
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @Patch(':publicationId/:commentId/:responseId')
  @UseInterceptors(FileInterceptor('image', {}))
  async update(
    @GetUser('id') userId: string,
    @Param('publicationId') publicationId: string,
    @Param('commentId') commentId: string,
    @Param('responseId') responseId: string,
    @Body() updateResponseDto: UpdateResponseDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.responsesService.update(
      userId,
      publicationId,
      commentId,
      responseId,
      updateResponseDto,
      image,
    );
  }

  @Delete(':publicationId/:commentId/:responseId')
  remove(
    @GetUser('id') userId: string,
    @Param('publicationId') publicationId: string,
    @Param('commentId') commentId: string,
    @Param('responseId') responseId: string,
  ) {
    return this.responsesService.remove(
      userId,
      publicationId,
      commentId,
      responseId,
    );
  }
}
