import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { PaginationService } from '../common/pagination.service';
import { JwtService } from '@nestjs/jwt';
import { MailsService } from '../mail/mail.service';

import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { File } from './entities/files.entity';
import { Address } from '../address/entities/address.entity';
import { CreateAddressDto } from '../address/dto/create-address.dto';
import { Block } from './entities/block.entity';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { FavUser } from './entities/fav_user.entity';
import { Verification } from './entities/verification_user';
import { ExternalVerificationService } from 'src/common/verification-user.service';
import { FilesVerificationUser } from './entities/files-verification-user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(FilesVerificationUser)
    private readonly filesVerificationUserRepository: Repository<FilesVerificationUser>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(FavUser)
    private readonly favUserRepository: Repository<FavUser>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly paginationService: PaginationService,
    private readonly externalVerificationService: ExternalVerificationService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly mailsService: MailsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async findAll(paginationDto: PaginationDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      relations: ['blocksReceived', 'file', 'address', 'stars'],
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        phoneNumber: true,
        birthdate: true,
        file: { url: true },
        address: { city: true },
        blocksReceived: {
          blockedUser: {
            id: true,
            name: true,
            lastname: true,
            file: { url: true },
          },
        },
        stars: { stars: true },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const blockedUserIds = user.blocksReceived.map(
      (block) => block.blockedUser.id,
    );

    const { data: users, meta } = await this.paginationService.paginate(
      this.userRepository,
      paginationDto,
      {
        where: {
          id: Not(In(blockedUserIds)),
          is_active: true,
        },
      },
    );

    return {
      data: users.map(({ password, ...rest }) => rest),
      meta,
    };
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id: id, is_active: true },
      relations: ['blocksReceived', 'file', 'address', 'stars'],
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        phoneNumber: true,
        birthdate: true,
        file: { url: true },
        address: { city: true },
        blocksReceived: { blockedUser: { id: true, name: true } },
        stars: { stars: true },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...rest } = user;

    return rest;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    image: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { password, birthdate, ...rest } = updateUserDto;

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId, is_active: true },
        relations: ['file', 'address'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (password) {
        user.pendingPassword = await bcrypt.hash(password, 10);
      } else {
        user.pendingPassword = null;
      }

      let newImageUrl: File | null = null;

      if (image) {
        if (user.file) {
          await queryRunner.manager.delete(File, { id: user.file.id });
        }

        const uploadedImage = await this.cloudinaryService.uploadFile(
          image.buffer,
          'user',
        );

        newImageUrl = uploadedImage.url;
      }

      Object.assign(user, rest, {
        pendingFileUrl: newImageUrl,
        pendingChangesConfirmed: false,
      });

      const confirmationToken = await this.jwtService.signAsync(
        { email: user.email },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '1d',
        },
      );

      await this.mailsService.sendChangesConfirmation({
        mail: user.email,
        token: confirmationToken,
      });

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return 'Updated User';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new NotFoundException('error');
    } finally {
      await queryRunner.release();
    }
  }

  async findSearchUser(
    name: string,
    lastname: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { name: name, lastname: lastname, is_active: true },
      relations: ['file'],
      select: {
        id: true,
        file: { url: true },
        name: true,
        lastname: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...rest } = user;

    return rest;
  }

  async confirmChanges(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { email: payload.email },
        relations: ['file'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.pendingFileUrl) {
        if (user.file) {
          await this.fileRepository.remove(user.file);
        }

        user.file = this.fileRepository.create({
          url: user.pendingFileUrl,
        });
        user.pendingFileUrl = null;
      }

      if (user.pendingPassword) {
        user.password = user.pendingPassword;
        user.pendingPassword = null;
      }

      user.pendingChangesConfirmed = true;

      await this.userRepository.save(user);

      return { message: 'Changes confirmed' };
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Invalid token');
    }
  }

  async addAdress(userId: string, adressUserDto: CreateAddressDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      relations: ['address'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newAddress = this.addressRepository.create({
      user: user,
      ...adressUserDto,
    });

    await this.addressRepository.save(newAddress);

    return 'Address added';
  }

  async removeAddress(userId: string, addressId: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      relations: ['address'],
    });

    if (!userAuth) {
      throw new NotFoundException('User not found');
    }

    const address = await this.addressRepository.findOne({
      where: { id: addressId, is_active: true, user: userAuth },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    address.is_active = false;
    await this.addressRepository.save(address);

    return { message: 'Address removed successfully' };
  }

  async remove(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      relations: ['file'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userDeleted = await this.userRepository.preload({
      ...user,
      is_active: false,
    });

    if (user.file) {
      await this.fileRepository.update(
        { id: user.file.id },
        { is_active: false },
      );
    }

    await this.userRepository.save(userDeleted);

    return 'User deleted successfully';
  }

  async blockUser(userId: string, blockUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const blockUser = await this.userRepository.findOne({
      where: { id: blockUserId, is_active: true },
    });

    if (!blockUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userBlock = this.blockRepository.create({
      blockedBy: user,
      blockedUser: blockUser,
      blocked: true,
    });

    await this.blockRepository.save(userBlock);

    return 'Usuario bloqueado exitosamente';
  }

  async unblockUser(userId: string, blockUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const blockUser = await this.userRepository.findOne({
      where: { id: blockUserId, is_active: true },
    });

    if (!blockUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userBlock = await this.blockRepository.findOne({
      where: { blockedBy: user, blockedUser: blockUser },
    });

    if (!userBlock) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.blockRepository.remove(userBlock);

    return 'Usuario desbloqueado exitosamente';
  }

  async reportedUser(
    userId: string,
    reportedUser: string,
    reportCreateDto: CreateReportDto,
  ) {
    console.log('here', reportCreateDto);
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reported = await this.userRepository.findOne({
      where: { id: reportedUser, is_active: true },
    });

    if (!reported) {
      throw new NotFoundException('User not found');
    }

    const report = this.reportRepository.create({
      reportedBy: user,
      reportedUser: reported,
      ...reportCreateDto,
    });

    await this.reportRepository.save(report);

    return 'User reported successfully';
  }

  async addFavorite(userId: string, favoriteUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    const favoriteUser = await this.userRepository.findOne({
      where: { id: favoriteUserId, is_active: true },
    });

    if (!user || !favoriteUser) {
      throw new NotFoundException('User not found');
    }

    const favorite = this.favUserRepository.create({
      user: user,
      favoriteUser: favoriteUser,
    });

    await this.favUserRepository.save(favorite);

    return 'Favorite added successfully';
  }

  async removeFavorite(userId: string, favoriteUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    const favoriteUser = await this.userRepository.findOne({
      where: { id: favoriteUserId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedFavorite = await this.favUserRepository.findOne({
      where: { user: user, favoriteUser: favoriteUser },
    });

    if (!deletedFavorite) {
      throw new NotFoundException('Favorite not found');
    }

    if (deletedFavorite) {
      await this.favUserRepository.remove(deletedFavorite);
    }

    return 'Favorite removed successfully';
  }

  async getFavorites(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      relations: [
        'favoritesInitiated',
        'favoritesInitiated.favoriteUser',
        'favoritesInitiated.favoriteUser.file',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.favoritesInitiated
      .filter((favorite) => favorite.favoriteUser && favorite.favoriteUser.file)
      .map((favorite) => ({
        id: favorite.favoriteUser.id,
        name: favorite.favoriteUser.name,
        lastname: favorite.favoriteUser.lastname,
        file: favorite.favoriteUser.file.url ?? '',
      }));
  }

  async requestAccountRecovery(email: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: email, is_active: false },
    });

    console.log('User found:', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.jwtService.signAsync(
      { email: user.email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      },
    );

    await this.mailsService.recoveryUser({
      mail: user.email,
      token,
    });

    return 'Recovery email sent successfully';
  }

  async recoverAccount(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.userRepository.findOne({
      where: { email: payload.email, is_active: false },
      relations: ['file'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = true;

    if (user.file) {
      user.file.is_active = true;
    }

    await this.userRepository.save(user);

    return 'User successfully recovered';
  }

  async verifyIdentity(userId: string, documents: Express.Multer.File[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let fileVerificationImages: FilesVerificationUser[] = [];

      if (documents && documents.length > 0) {
        fileVerificationImages = await Promise.all(
          documents.map(async (document) => {
            const uploadImage = await this.cloudinaryService.uploadFile(
              document.buffer,
              'verification-user',
            );

            return queryRunner.manager.create(FilesVerificationUser, {
              url: uploadImage.url,
            });
          }),
        );
      }

      if (!fileVerificationImages || fileVerificationImages.length !== 3) {
        throw new BadRequestException(
          'Front, back, and face images are required',
        );
      }

      const [file_front, file_back, faceFileUrl] = fileVerificationImages.map(
        (file) => file.url,
      );

      const verification = this.verificationRepository.create({
        user,
        documentUrls: [file_front, file_back],
        faceUrl: faceFileUrl,
        verificationStatus: 'PENDING',
      });

      await this.verificationRepository.save(verification);

      const externalResponse = await this.externalVerificationService.verify({
        userId: user.id,
        documentUrls: verification.documentUrls,
        faceFileUrl: verification.faceUrl,
      });

      verification.verificationStatus =
        externalResponse.status === 'approved' ? 'APPROVED' : 'REJECTED';
      verification.externalResponse = JSON.stringify(externalResponse);

      await this.verificationRepository.save(verification);

      return verification;
    } catch (error) {
      console.error('Error in verifyIdentity:', error);
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
}
