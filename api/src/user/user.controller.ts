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
  UploadedFile,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from '../decorators/auth.decorator';
import { Roles } from '../enums/enum.roles';
import { GetUser } from '../decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAddressDto } from '../address/dto/create-address.dto';
import { CreateReportDto } from './dto/create-report.dto';


@Auth(Roles.ADMIN, Roles.USER)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('filter/searchFeed')
  @HttpCode(HttpStatus.OK)
  searchUser(@Query('name') name: string, @Query('lastname') lastname: string) {
    console.log('entrando' + name + ' ' + lastname);
    return this.userService.findSearchUser(name, lastname);
  }

  @Get('find/all')
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() paginationDto: PaginationDto,
    @GetUser('id') userId: string,
  ) {
    return this.userService.findAll(paginationDto, userId);
  }

  @Get('find/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', {}))
  update(
    @GetUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.userService.updateUser(userId, updateUserDto, image);
  }

  @Post('validation/confirm')
  @HttpCode(HttpStatus.OK)
  confirmChanges(@Body('token') token: string) {
    return this.userService.confirmChanges(token);
  }

  @Post('config/add-address')
  @HttpCode(HttpStatus.OK)
  addAdress(
    @GetUser('id') userId: string,
    @Body() addressUserDto: CreateAddressDto,
  ) {
    return this.userService.addAdress(userId, addressUserDto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  remove(@GetUser('id') userId: string) {
    return this.userService.remove(userId);
  }

  @Post('validation/recovery-request')
  @HttpCode(HttpStatus.OK)
  requestAccountRecovery(@Body('email') email: string) {
    return this.userService.requestAccountRecovery(email);
  }

  @Post('validation/recovery-confirm')
  @HttpCode(HttpStatus.OK)
  @Auth(Roles.ADMIN, Roles.USER)
  confirmAccountRecovery(@Body('token') token: string) {
    return this.userService.recoverAccount(token);
  }

  @Post('config/block-user/:blockUserId')
  @HttpCode(HttpStatus.OK)
  blockUser(
    @GetUser('id') userId: string,
    @Param('blockUserId') blockUserId: string,
  ) {
    return this.userService.blockUser(userId, blockUserId);
  }

  @Post('config/unblock-user/:blockUserId')
  @HttpCode(HttpStatus.OK)
  unblockUser(
    @GetUser('id') userId: string,
    @Param('blockUserId') blockUserId: string,
  ) {
    return this.userService.unblockUser(userId, blockUserId);
  }

  @Post('config/report-user/:reportedUserId')
  @HttpCode(HttpStatus.OK)
  reportUser(
    @GetUser('id') userId: string,
    @Param('reportedUser') reportedUser: string,
    @Body() reportCreateDto: CreateReportDto,
  ) {
    return this.userService.reportedUser(userId, reportedUser, reportCreateDto);
  }
}
