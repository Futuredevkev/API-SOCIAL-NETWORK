import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MailsModule } from '../mail/mail.module';
import { UserImageUploadStrategy } from '../cloudinary/strategy/user-image-strategy';
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address]),
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    CloudinaryModule,
    MailsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserImageUploadStrategy, IAImageStrategy],
  exports: [AuthService],
})
export class AuthModule {}
