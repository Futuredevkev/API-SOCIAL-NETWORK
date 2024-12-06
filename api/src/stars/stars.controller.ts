import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { StarsService } from './stars.service';
import { CreateStarDto } from './dto/create-star.dto';
import { UpdateStarDto } from './dto/update-star.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('stars')
@Auth(Roles.ADMIN, Roles.USER)
@Controller('stars')
export class StarsController {
  constructor(private readonly starsService: StarsService) {}

  @Post(':targetUserId')
  create(
    @Body() createStarDto: CreateStarDto,
    @GetUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.starsService.addPointsUser(createStarDto, userId, targetUserId);
  }

  @Get('find/total-stars/:forUserId')
  async getTotalPoints(
    @GetUser('id') userId: string,
    @Param('forUserId') forUserId: string,
  ) {
    return this.starsService.getPointsStats(userId, forUserId);
  }

  @Patch(':targetUserId/:starId')
  update(
    @Param('targetUserId') targetUserId: string,
    @Param('starId', ParseIntPipe) starId: number,
    @Body() updateStarDto: UpdateStarDto,
    @GetUser('id') userId: string,
  ) {
    return this.starsService.updatePointsUser(
      updateStarDto,
      userId,
      targetUserId,
      starId,
    );
  }

  @Delete(':targetUserId/:starId')
  remove(
    @Param('targetUserId') targetUserId: string,
    @GetUser('id') userId: string,
    @Param('starId', ParseIntPipe) starId: number,
  ) {
    return this.starsService.removePointsUser(userId, targetUserId, starId);
  }
}
