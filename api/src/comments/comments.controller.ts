import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/decorators/get-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Auth(Roles.ADMIN, Roles.USER)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':publicationId')
  @UseInterceptors(FileInterceptor('image', {}))
  async create(
    @GetUser('id') userId: string,
    @Param('publicationId') publicationId: string,
    @Body() createCommentDto: CreateCommentDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.commentsService.createComment(
      userId,
      publicationId,
      createCommentDto,
      image,
    );
  }

  @Get('find/commentsUser')
  async findCommentsByUser(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findCommentsByUser(userId, paginationDto);
  }

  @Get('find/findCommentsByPublication/:publicationId')
  async findCommentsByPublication(
    @Param('publicationId') publicationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findCommentsByPublication(
      publicationId,
      paginationDto,
    );
  }

  @Get('find/all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.commentsService.findAll(paginationDto);
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':publicationId/:commentId')
  @UseInterceptors(FileInterceptor('image', {}))
  async update(
    @GetUser('id') userId: string,
    @Param('publicationId') publicationId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.commentsService.update(
      userId,
      publicationId,
      commentId,
      updateCommentDto,
      image,
    );
  }

  @Delete(':publicationId/:commentId')
  async remove(
    @GetUser('id') userId: string,
    @Param('publicationId') publicationId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.remove(userId, publicationId, commentId);
  }
}
