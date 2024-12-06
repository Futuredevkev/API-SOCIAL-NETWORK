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
  ParseIntPipe,
} from '@nestjs/common';
import { ComunitiesService } from './comunities.service';
import { CreateComunityDto } from './dto/create-comunity.dto';
import { UpdateComunityDto } from './dto/update-comunity.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { createRoleDto } from './dto/create-role.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comunities')
@Auth(Roles.ADMIN, Roles.USER)
@Controller('comunities')
export class ComunitiesController {
  constructor(private readonly comunitiesService: ComunitiesService) {}

  @Post('initiate-payment')
  async initiatePayment(
    @Body() initiatePaymentDto: InitiatePaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.comunitiesService.initiatePayment(initiatePaymentDto, userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', {}))
  createCommunity(
    @Body() createComunityDto: CreateComunityDto,
    @GetUser('id') userId: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.comunitiesService.completeCommunityCreation(
      createComunityDto,
      userId,
      image,
    );
  }

  @Post('addUserToCommunity/:communityId/:userTargetId')
  addUserToCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Param('userTargetId') userTargetId: string,
  ) {
    return this.comunitiesService.addUserToCommunity(
      userId,
      communityId,
      userTargetId,
    );
  }
  @Post('addRoleToUser/:communityId/:userTargetId')
  addRoleToUser(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Param('userTargetId', ParseIntPipe) userTargetId: number,
    @Body() createRoleDto: createRoleDto,
  ) {
    return this.comunitiesService.addRoleToUser(
      userId,
      communityId,
      userTargetId,
      createRoleDto,
    );
  }

  @Get('allComunities')
  allComunities(@Query() paginationDto: PaginationDto) {
    return this.comunitiesService.allCommunities(paginationDto);
  }

  @Get('allComunitiesByUser')
  allComunitiesByUser(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comunitiesService.allCommunitiesByUser(userId, paginationDto);
  }

  @Get('idCommunity/:communityId')
  findOneCommunity(@Param('communityId') communityId: string) {
    return this.comunitiesService.getCommunityById(communityId);
  }

  @Patch(':communityId')
  @UseInterceptors(FileInterceptor('image', {}))
  updateCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateComunityDto: UpdateComunityDto,
  ) {
    return this.comunitiesService.updateCommunity(
      userId,
      communityId,
      image,
      updateComunityDto,
    );
  }

  @Delete(':communityId')
  removeCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
  ) {
    return this.comunitiesService.removeCommunity(userId, communityId);
  }

  @Delete('removeUserFromCommunity/:communityId/:userTargetId')
  removeUserToComunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Param('userTargetId', ParseIntPipe) userTargetId: number,
  ) {
    return this.comunitiesService.removeUserToComunity(
      userId,
      communityId,
      userTargetId,
    );
  }

  @Get(':communityId/users/admins')
  async findAdminsOfCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comunitiesService.findAdminsOfCommunity(
      userId,
      communityId,
      paginationDto,
    );
  }

  @Get(':communityId/users/helpers')
  async findHelpersOfCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comunitiesService.findHelpersOfCommunity(
      communityId,
      paginationDto,
      userId,
    );
  }

  @Get(':communityId/users/members')
  async findMembersOfCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comunitiesService.findMembersOfCommunity(
      communityId,
      paginationDto,
      userId,
    );
  }

  @Get(':communityId/users')
  async findAllUsersOfCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comunitiesService.findAllUsersOfCommunity(
      userId,
      communityId,
      paginationDto,
    );
  }
}
