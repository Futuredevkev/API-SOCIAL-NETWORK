import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Address } from '../address/entities/address.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateAddressDto } from '../address/dto/create-address.dto';
import { LoginUserDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailsService } from '../mail/mail.service';
import { spawnSync } from 'child_process';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailsService,
  ) {}
  async create(
    addressUserDto: CreateAddressDto,
    createUserDto: CreateUserDto,
    image: Express.Multer.File,
    faceImage: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, password, ...rest } = createUserDto;

      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const imageUser = await this.cloudinaryService.uploadFile(
        image.buffer,
        'user',
      );

      const newAddress = queryRunner.manager.create(Address, {
        ...addressUserDto,
      });

      const faceImageUser = await this.cloudinaryService.uploadFile(
        faceImage.buffer,
        'ia-upload',
      );

      const user = queryRunner.manager.create(User, {
        ...rest,
        email,
        password: hashedPassword,
        file: imageUser.url,
        faceFile: faceImageUser.url,
        address: newAddress,
        is_active: false,
      });

      const pythonProcess = spawnSync('python', [
        '../../../facial_ia/facial.py',
        'save_face',
        faceImage.path,
      ]);

      if (pythonProcess.status !== 0) {
        throw new ConflictException('Face encoding failed');
      }

      const faceEncoding = JSON.parse(pythonProcess.stdout.toString());
      user.face_encoding = faceEncoding;

      const verificationToken = crypto.randomBytes(32).toString('hex');

      user.verification_token = verificationToken;

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      await this.mailService.sendVerificationEmail({
        mailUser: user.email,
        token: verificationToken,
      });

      return { email: user.email, message: 'Verification email sent' };
    } catch (error) {
      console.error('Error creating user:', error);
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Error creating user');
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = true;
    user.verification_token = null;

    await this.usersRepository.save(user);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.hash_refresh_token = null;

    await this.usersRepository.save(user);
  }

  async forgotPassword(mailUser: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email: mailUser },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await this.usersRepository.save(user);

    await this.mailService.sendForgotPassword({
      mailUser: user.email,
      token: resetToken,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { resetToken: token },
    });

    if (!user) {
      console.log('User not found or token is incorrect');
      throw new NotFoundException('Invalid or expired token');
    }

    if (new Date() > user.resetTokenExpiry) {
      throw new NotFoundException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.usersRepository.save(user);
  }

  async login(loginDto: LoginUserDto, faceEncoding: string) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new NotFoundException('Invalid credentials');
    }

    const pythonProcess = spawnSync('python', [
      '../../../facial_ia/facial.py',
      'verify_face',
      JSON.stringify(faceEncoding),
      JSON.stringify(user.face_encoding),
    ]);

    if (pythonProcess.status !== 0) {
      throw new ConflictException('Face validation failed');
    }

    const result = JSON.parse(pythonProcess.stdout.toString());

    if (!result.match) {
      throw new ConflictException('Face does not match');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return { email: user.email, name: user.name, ...tokens };
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accesToken = await this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accesToken, refreshToken };
  }

  async refreshToken(userId: string, refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.sub !== userId) {
        throw new ConflictException('Invalid user');
      }

      return this.generateTokens(userId, payload.email);
    } catch (error) {
      throw new NotFoundException('Invalid token');
    }
  }
}
