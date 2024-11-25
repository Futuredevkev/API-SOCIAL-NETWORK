import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Address } from '../address/entities/address.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as os from 'os';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateAddressDto } from '../address/dto/create-address.dto';
import { LoginUserDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailsService } from '../mail/mail.service';
import { spawnSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { File } from 'src/user/entities/files.entity';
import { FaceFile } from 'src/user/entities/face_file.entity';

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
    let faceEncoding;

    const queryRunner = this.dataSource.manager.connection.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, `face-${Date.now()}.jpg`);

    try {
      const { email, password, ...rest } = createUserDto;

      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let fileImage: File | null = null;

      if (image) {
        const imageUser = await this.cloudinaryService.uploadFile(
          image.buffer,
          'user',
        );

        if (!imageUser || !imageUser.url) {
          throw new ConflictException('Image not found');
        }

        fileImage = queryRunner.manager.create(File, {
          url: imageUser.url,
        });
      }

      const newAddress = queryRunner.manager.create(Address, {
        ...addressUserDto,
      });

      console.log('Uploading face image to Cloudinary...');

      let fileImageFace: FaceFile | null = null;

      if (image) {
        const faceImageUser = await this.cloudinaryService.uploadFile(
          faceImage.buffer,
          'ia-upload',
        );

        if (!faceImageUser || !faceImageUser.url) {
          throw new ConflictException('Face image not found');
        }

        fileImageFace = queryRunner.manager.create(FaceFile, {
          url: faceImageUser.url,
        });
      }

      writeFileSync(tempFilePath, faceImage.buffer);

      const pythonScriptPath = join('src/auth/python/facial.py');

      if (!existsSync(pythonScriptPath)) {
        console.error('Python script not found at:', pythonScriptPath);
        throw new ConflictException('Python script not found');
      }

      const pythonProcess = spawnSync(
        'python',
        [pythonScriptPath, 'save_face', tempFilePath],
        {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );

      if (!pythonProcess.stdout || pythonProcess.stdout.trim().length === 0) {
        console.error('No output from Python process');
        throw new ConflictException('No output from face encoding process');
      }

      if (pythonProcess.stdout && pythonProcess.stdout.trim().length > 0) {
        try {
          console.log('Parsing face encoding output...');
          faceEncoding = JSON.parse(pythonProcess.stdout);
          console.log('Face encoding parsed successfully');
        } catch (error) {
          console.error('Error parsing face encoding:', error);
          console.error('Raw output:', pythonProcess.stdout);
          throw new ConflictException('Error parsing face encoding output');
        }
      } else {
        console.error('No output from Python process');
        console.error('stderr:', pythonProcess.stderr);
        throw new ConflictException('No output from face encoding process');
      }

      if (pythonProcess.stderr && pythonProcess.stderr.length > 0) {
        console.error('Python process error:', pythonProcess.stderr);
        throw new ConflictException(
          'Face encoding failed: ' + pythonProcess.stderr,
        );
      }

      if (pythonProcess.status !== 0) {
        console.error(
          'Python process failed with status:',
          pythonProcess.status,
        );
        throw new ConflictException(
          'Face encoding failed with status: ' + pythonProcess.status,
        );
      }

      if (!pythonProcess.stdout || pythonProcess.stdout.trim().length === 0) {
        console.error('No output from Python process');
        throw new ConflictException('No output from face encoding process');
      }

      try {
        faceEncoding = JSON.parse(pythonProcess.stdout);
        console.log('Face encoding parsed successfully');
      } catch (e) {
        console.error('Error parsing face encoding:', e);
        console.error('Raw output:', pythonProcess.stdout);
        throw new ConflictException('Error parsing face encoding output');
      }

      console.log('Creating user record...');
      const user = queryRunner.manager.create(User, {
        ...rest,
        email,
        password: hashedPassword,
        file: fileImage,
        faceFile: fileImageFace,
        address: newAddress,
        face_encoding: faceEncoding,
        is_active: false,
      });

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
      console.error('Error in create user process:', error);
      await queryRunner.rollbackTransaction();
      console.log('Transaction rolled back due to error');
      throw new ConflictException(error.message || 'Error creating user');
    } finally {
      try {
        if (existsSync(tempFilePath)) {
          unlinkSync(tempFilePath);
        }
      } catch (err) {
        console.error('Error cleaning up temporary file:', err);
      }

      await queryRunner.release();
    }
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = true;
    user.verification_token = null;

    await this.usersRepository.save(user);

    return 'User successfully verified';
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

  async login(loginDto: LoginUserDto) {
    const { email, password, face_encoding } = loginDto;

    console.log('Processing login for email:', email);
    console.log('Face encoding received:', face_encoding ? 'yes' : 'no');

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const pythonScriptPath = join('src/auth/python/facial.py');

    if (!existsSync(pythonScriptPath)) {
      console.error('Python script not found at:', pythonScriptPath);
      throw new ConflictException('Python script not found');
    }

   
    if (
      !face_encoding ||
      !face_encoding.encoding ||
      !Array.isArray(face_encoding.encoding)
    ) {
      throw new BadRequestException('Invalid face encoding format');
    }

   
    let storedEncoding;

    try {
      storedEncoding =
        typeof user.face_encoding === 'string'
          ? JSON.parse(user.face_encoding)
          : user.face_encoding;

      if (!storedEncoding.encoding || !Array.isArray(storedEncoding.encoding)) {
        throw new Error('Invalid stored face encoding structure');
      }
    } catch (error) {
      console.error('Stored face encoding error:', error);
      throw new ConflictException('Invalid stored face encoding format');
    }

    
    const pythonProcess = spawnSync(
      'python',
      [
        pythonScriptPath,
        'verify_face',
        JSON.stringify(face_encoding.encoding),
        JSON.stringify(storedEncoding.encoding),
      ],
      {
        encoding: 'utf8',
      },
    );

    if (pythonProcess.error) {
      console.error('Python process error:', pythonProcess.error);
      throw new ConflictException('Face verification process failed');
    }

    if (pythonProcess.stderr && pythonProcess.stderr.length > 0) {
      console.error('Python error output:', pythonProcess.stderr);
      throw new ConflictException('Face verification process error');
    }

    let result;

    try {
      result = JSON.parse(pythonProcess.stdout.trim());
      console.log('Face verification result:', result);
    } catch (error) {
      console.error('Error parsing verification result:', error);
      throw new ConflictException('Error processing verification result');
    }

    console.log('result', result);
    console.log('storedEncoding', storedEncoding);

    if (!result.match) {
      throw new UnauthorizedException('Face verification failed');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      email: user.email,
      name: user.name,
      ...tokens,
    };
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
