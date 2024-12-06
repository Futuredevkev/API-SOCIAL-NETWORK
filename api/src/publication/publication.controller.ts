import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { PublicationService } from './publication.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ItemTag } from 'src/enums/enum.tags';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { categoryTag } from 'src/enums/enum.category';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('publication')
@Auth(Roles.ADMIN, Roles.USER)
@Controller('publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 10, {}))
  create(
    @Body() createPublicationDto: CreatePublicationDto,
    @GetUser('id') userId: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.publicationService.createPublication(
      createPublicationDto,
      userId,
      images,
    );
  }

  @Get('find/all')
  findAllPublication(@Query() paginationDto: PaginationDto) {
    return this.publicationService.findAllPublication(paginationDto);
  }

  @Get('find/region')
  findPublicationsByRegion(
    @Query() paginationDto: PaginationDto,
    @GetUser('id') userId: string,
  ) {
    return this.publicationService.filterPublicationsByUserRegion(
      userId,
      paginationDto,
    );
  }

  @Get('find/publications-user')
  findAllUserPublication(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.publicationService.findAllUserPublication(
      userId,
      paginationDto,
    );
  }

  @Get('filter/filterByTag')
  filterPublicationsByTags(
    @Query('tag') tag: ItemTag,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.publicationService.filterPublicationsByTag(tag, paginationDto);
  }

  @Get('filter/filterByUser')
  filterPublicationsByUser(
    @Query('targetUserId') targetUserId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.publicationService.filterPublicationsByUser(
      targetUserId,
      paginationDto,
    );
  }

  @Get('filter/filterByCategory')
  filterPublicationsByCategory(
    @Query('category') category: categoryTag,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.publicationService.filterPublicationsByCategory(
      category,
      paginationDto,
    );
  }

  @Get('find/:id')
  findOnePublication(@Param('id') publicationId: string) {
    return this.publicationService.findOnePublication(publicationId);
  }

  @Patch(':publicationId')
  @UseInterceptors(FilesInterceptor('images', 10, {}))
  updatePublication(
    @Param('publicationId') publicationId: string,
    @GetUser('id') userId: string,
    @Body() updatePublicationDto: UpdatePublicationDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.publicationService.updatePublication(
      userId,
      updatePublicationDto,
      publicationId,
      images,
    );
  }

  @Delete(':publicationId')
  removePublication(
    @Param('publicationId') publicationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.publicationService.removePublication(userId, publicationId);
  }
}
