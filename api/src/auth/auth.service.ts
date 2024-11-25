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
    console.log('=== Starting user creation process ===');
    console.log('Received DTOs:', { addressUserDto, createUserDto });
    console.log('Received files:', {
      image: image?.originalname,
      faceImage: faceImage?.originalname,
    });

    const queryRunner = this.dataSource.manager.connection.createQueryRunner();
    console.log('Created query runner');

    await queryRunner.connect();
    console.log('Connected to database');

    await queryRunner.startTransaction();
    console.log('Started transaction');

    // Crear archivo temporal para la imagen facial
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, `face-${Date.now()}.jpg`);
    console.log('Temporary file path:', tempFilePath);

    try {
      const { email, password, ...rest } = createUserDto;
      console.log('Processing user data for email:', email);

      // Verificar usuario existente
      console.log('Checking for existing user...');
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email },
      });

      if (existingUser) {
        console.log('User already exists:', email);
        throw new ConflictException('User already exists');
      }

      // Hash password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');

      // Subir imagen de usuario
      console.log('Uploading user image to Cloudinary...');
      const imageUser = await this.cloudinaryService.uploadFile(
        image.buffer,
        'user',
      );
      console.log('User image uploaded:', imageUser.url);

      // Crear dirección
      console.log('Creating address record...');
      const newAddress = queryRunner.manager.create(Address, {
        ...addressUserDto,
      });
      console.log('Address created:', newAddress);

      // Subir imagen facial
      console.log('Uploading face image to Cloudinary...');
      const faceImageUser = await this.cloudinaryService.uploadFile(
        faceImage.buffer,
        'ia-upload',
      );
      console.log('Face image uploaded:', faceImageUser.url);

      if (!faceImageUser) {
        console.error('Face image upload failed');
        throw new ConflictException('Face image not found');
      }

      // Guardar buffer como archivo temporal
      console.log('Writing face image to temporary file...');
      writeFileSync(tempFilePath, faceImage.buffer);
      console.log('Temporary file created successfully');

      // Verificar existencia del script Python
      const pythonScriptPath = join('src/auth/python/facial.py');
      console.log('Python script path:', pythonScriptPath);

      if (!existsSync(pythonScriptPath)) {
        console.error('Python script not found at:', pythonScriptPath);
        throw new ConflictException('Python script not found');
      }
      console.log('Python script found successfully');

      // Ejecutar script Python
      console.log('Executing Python script...');
      const pythonProcess = spawnSync(
        'python',
        [pythonScriptPath, 'save_face', tempFilePath],
        {
          encoding: 'utf8',
          stdio: 'pipe',
        },
      );

      // Log detallado del proceso Python
      console.log('Python process completed');
      console.log('Exit code:', pythonProcess.status);
      console.log('stdout:', pythonProcess.stdout);
      console.log('stderr:', pythonProcess.stderr);

      // Verificar errores del proceso Python
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

      // Parsear el encoding facial
      let faceEncoding;
      try {
        console.log('Parsing face encoding output...');
        faceEncoding = JSON.parse(pythonProcess.stdout);
        console.log('Face encoding parsed successfully');
      } catch (e) {
        console.error('Error parsing face encoding:', e);
        console.error('Raw output:', pythonProcess.stdout);
        throw new ConflictException('Error parsing face encoding output');
      }

      // Crear usuario
      console.log('Creating user record...');
      const user = queryRunner.manager.create(User, {
        ...rest,
        email,
        password: hashedPassword,
        file: imageUser.url,
        faceFile: faceImageUser.url,
        address: newAddress,
        face_encoding: faceEncoding,
        is_active: false,
      });
      console.log('User record created:', user.email);

      // Generar token de verificación
      console.log('Generating verification token...');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verification_token = verificationToken;
      console.log('Verification token generated');

      // Guardar usuario
      console.log('Saving user to database...');
      await queryRunner.manager.save(user);
      console.log('User saved successfully');

      // Commit transaction
      console.log('Committing transaction...');
      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

      // Enviar email de verificación
      console.log('Sending verification email...');
      await this.mailService.sendVerificationEmail({
        mailUser: user.email,
        token: verificationToken,
      });
      console.log('Verification email sent successfully');

      return { email: user.email, message: 'Verification email sent' };
    } catch (error) {
      console.error('Error in create user process:', error);
      console.error('Stack trace:', error.stack);
      await queryRunner.rollbackTransaction();
      console.log('Transaction rolled back due to error');
      throw new ConflictException(error.message || 'Error creating user');
    } finally {
      // Limpiar archivo temporal
      try {
        console.log('Cleaning up temporary file:', tempFilePath);
        unlinkSync(tempFilePath);
        console.log('Temporary file cleaned up successfully');
      } catch (err) {
        console.error('Error cleaning up temporary file:', err);
      }

      // Liberar query runner
      await queryRunner.release();
      console.log('Query runner released');
      console.log('=== User creation process completed ===');
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
      './face/facial.py',
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
