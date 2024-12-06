import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('like')
@Auth(Roles.USER, Roles.ADMIN)
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':publicationId/needLike')
  @HttpCode(HttpStatus.CREATED)
  needLike(
    @Param('publicationId') publicationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.likeService.needLike(userId, publicationId);
  }

  @Post(':publicationId/changeLike')
  @HttpCode(HttpStatus.CREATED)
  changeLike(
    @Param('publicationId') publicationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.likeService.changeLike(userId, publicationId);
  }

  @Get(':publicationId/needLikes')
  getLikes(@Param('publicationId') publicationId: string) {
    return this.likeService.showNeedsLikePublication(publicationId);
  }

  @Get(':publicationId/changeLikes')
  getChangeLikes(@Param('publicationId') publicationId: string) {
    return this.likeService.showChangeLikesPublication(publicationId);
  }

  @Delete('needLike/:needLikeId')
  @HttpCode(HttpStatus.OK)
  deleteNeedLike(
    @Param('needLikeId', ParseIntPipe) needLikeId: number,
    @GetUser('id') userId: string,
  ) {
    return this.likeService.removeNeedLike(userId, needLikeId);
  }

  @Delete('changeLike/:changeLikeId')
  @HttpCode(HttpStatus.OK)
  deleteChangeLike(
    @Param('changeLikeId', ParseIntPipe) changeLikeId: number,
    @GetUser('id') userId: string,
  ) {
    return this.likeService.removeChangeLike(userId, changeLikeId);
  }
}
