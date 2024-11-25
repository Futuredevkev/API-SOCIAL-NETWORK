import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateAddressDto } from '../address/dto/create-address.dto';
import { LoginUserDto } from './dto/login-auth.dto';
import { GetUser } from '../decorators/get-user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { Auth } from '../decorators/auth.decorator';
import { Roles } from '../enums/enum.roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'faceImage', maxCount: 1 },
    ]),
  )
  async register(
    @Body() createUserDto: CreateUserDto,
    @Body() addressUserDto: CreateAddressDto,
    @UploadedFiles()
    files: {
      image: Express.Multer.File[];
      faceImage: Express.Multer.File[];
    },
  ) {
    const image = files.image?.[0];
    const faceImage = files.faceImage?.[0];

    return this.authService.create(
      addressUserDto,
      createUserDto,
      image,
      faceImage,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('logout')
  @Auth(Roles.ADMIN, Roles.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('refresh')
  @Auth(Roles.ADMIN, Roles.USER)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetUser('id') userId: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
