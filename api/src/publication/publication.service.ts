import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Publication } from './entities/publication.entity';
import { DataSource, In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ItemTag } from 'src/enums/enum.tags';
import { categoryTag } from 'src/enums/enum.category';
import { penalizedWords } from 'src/enums/enum.penalizes';
import { UbicationService } from 'src/globalMethods/ubication.service';
import { FilePublication } from './entities/filePublication.entity';
import { Community } from 'src/comunities/entities/comunity.entity';
@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FilePublication)
    private readonly filePublicationRepository: Repository<FilePublication>,
    private readonly paginationService: PaginationService,
    private readonly CloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
  ) {}

  async createPublication(
    createPublicationDto: CreatePublicationDto,
    userId: string,
    images?: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAuth = await queryRunner.manager.findOne(User, {
        where: { id: userId, is_active: true },
      });

      if (!userAuth) {
        throw new BadRequestException('User not found');
      }

      await this.checkForPricesAndDeactivateUser(
        createPublicationDto,
        {},
        userAuth,
      );

      let imagesPublication: FilePublication[] = [];

      if (images && images.length > 0) {
        imagesPublication = await Promise.all(
          images.map(async (img) => {
            const uploadImage = await this.CloudinaryService.uploadFile(
              img.buffer,
              'post',
            );

            return queryRunner.manager.create(FilePublication, {
              url: uploadImage.url,
            });
          }),
        );
      }

      let community = null;

      if (createPublicationDto.communityId) {
        community = await queryRunner.manager.findOne(Community, {
          where: { id: createPublicationDto.communityId, is_active: true },
        });

        if (!community) {
          throw new BadRequestException('Community not found');
        }
      }

      const publication = queryRunner.manager.create(Publication, {
        ...createPublicationDto,
        user: userAuth,
        files: imagesPublication,
        community: community,
      });

      await queryRunner.manager.save(publication);
      await queryRunner.commitTransaction();

      return { message: 'Publication created successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllPublication(paginationDto: PaginationDto) {
    const { data: publications, meta } = await this.paginationService.paginate(
      this.publicationRepository,
      paginationDto,
      {
        where: { is_active: true, user: { is_active: true } },
        relations: ['user', 'files', 'needLikes', 'changeLikes'],
        select: {
          id: true,
          title: true,
          description: true,
          tag: true,
          category: true,
          files: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );
    return {
      data: publications,
      meta,
    };
  }

  async filterPublicationsByUserRegion(
    userId: string,
    paginationDto: PaginationDto,
  ) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['address'],
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const userAdress = authUser.address;

    if (
      !userAdress ||
      userAdress.latitude === undefined ||
      userAdress.longitude === undefined
    ) {
      throw new BadRequestException('User address not found');
    }

    const { data: publications, meta } = await this.paginationService.paginate(
      this.publicationRepository,
      paginationDto,
      {
        where: { is_active: true, user: { is_active: true } },
        relations: ['user', 'files'],
        select: {
          id: true,
          title: true,
          description: true,
          tag: true,
          category: true,
          files: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );

    const nearByPublications = publications.filter((publication) => {
      UbicationService.isPublicationNearBy(
        publication,
        userAdress.latitude,
        userAdress.longitude,
      );
    });

    return {
      data: nearByPublications,
      meta,
    };
  }

  async findOnePublication(publicationId: string) {
    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId, is_active: true, user: { is_active: true } },
      relations: ['user', 'files', 'needLikes', 'changeLikes'],
      select: {
        id: true,
        title: true,
        description: true,
        tag: true,
        category: true,
        files: {
          url: true,
        },
        user: {
          id: true,
          name: true,
          lastname: true,
          file: {
            url: true,
          },
        },
      },
    });

    if (!publication) {
      throw new BadRequestException('Publication not found');
    }

    return publication;
  }

  async findAllUserPublication(userId: string, paginationDto: PaginationDto) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const { data: publications, meta } = await this.paginationService.paginate(
      this.publicationRepository,
      paginationDto,
      {
        where: { user: userAuth, is_active: true },
        relations: ['user', 'files', 'needLikes', 'changeLikes'],
        select: {
          id: true,
          title: true,
          description: true,
          tag: true,
          category: true,
          files: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );

    return {
      data: publications,
      meta,
    };
  }

  async updatePublication(
    userId: string,
    updatePublicationDto: UpdatePublicationDto,
    publicationId: string,
    images: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAuth = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!userAuth) {
        throw new BadRequestException('User not found');
      }

      const publication = await queryRunner.manager.findOne(Publication, {
        where: { id: publicationId },
        relations: ['files', 'user'],
      });

      if (!publication) {
        throw new BadRequestException('Publication not found');
      }

      if (publication.user.id !== userAuth.id) {
        throw new BadRequestException(
          'Publication does not belong to the user',
        );
      }

      await this.checkForPricesAndDeactivateUser(
        updatePublicationDto,
        {},
        userAuth,
      );

      const { ids_images } = updatePublicationDto;

      if (ids_images && ids_images.length > 0) {
        const idsAsNumbers = ids_images.map((id) => Number(id));

        const imagesToDelete = publication.files.filter(
          (file) => !idsAsNumbers.includes(Number(file.id)),
        );

        if (imagesToDelete.length > 0) {
          await queryRunner.manager.remove(FilePublication, imagesToDelete);
        }

        publication.files = publication.files.filter((file) =>
          idsAsNumbers.includes(Number(file.id)),
        );
      } else {
        if (publication.files.length > 0) {
          await queryRunner.manager.remove(FilePublication, publication.files);
          publication.files = [];
        }
      }

      let newImages: FilePublication[] = [];
      if (images && images.length > 0) {
        const uploadedImages = await Promise.all(
          images.map((img) =>
            this.CloudinaryService.uploadFile(img.buffer, 'post'),
          ),
        );

        newImages = uploadedImages.map((img) =>
          this.filePublicationRepository.create({ url: img.url }),
        );

        await queryRunner.manager.save(FilePublication, newImages);
        publication.files = [...publication.files, ...newImages];
      }

      const updatedPublication = await queryRunner.manager.preload(
        Publication,
        {
          id: publication.id,
          ...updatePublicationDto,
          files: publication.files,
        },
      );

      if (!updatedPublication) {
        throw new BadRequestException('Publication not updated');
      }

      await queryRunner.manager.save(Publication, updatedPublication);
      await queryRunner.commitTransaction();

      return { message: 'Publication updated' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new BadRequestException('Update failed');
    } finally {
      await queryRunner.release();
    }
  }

  async removePublication(userId: string, publicationId: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId },
      relations: ['user', 'files'],
    });

    if (!publication) {
      throw new BadRequestException('Publication not found');
    }

    if (publication.user.id !== userAuth.id) {
      throw new BadRequestException('Publication not belong to the user');
    }

    const removedPublication = await this.publicationRepository.preload({
      id: publicationId,
      is_active: false,
    });

    if (publication.files) {
      await Promise.all(
        publication.files.map(async (file) => {
          await this.filePublicationRepository.update(
            { id: file.id },
            { is_active: false },
          );
        }),
      );
    }

    if (!removedPublication) {
      throw new BadRequestException('Publication not removed');
    }

    this.publicationRepository.save(removedPublication);

    return { message: 'Publication removed' };
  }

  async filterPublicationsByTag(tag: ItemTag, paginationDto: PaginationDto) {
    const { data: publications, meta } = await this.paginationService.paginate(
      this.publicationRepository,
      paginationDto,
      {
        where: { is_active: true, tag: tag, user: { is_active: true } },
        relations: ['user', 'files'],
        select: {
          id: true,
          title: true,
          description: true,
          tag: true,
          category: true,
          files: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );

    if (publications.length === 0) {
      throw new NotFoundException('No publications found for the given tag');
    }

    return {
      data: publications,
      meta,
    };
  }

  async filterPublicationsByUser(
    targetUserId: string,
    paginationDto: PaginationDto,
  ) {
    const { data: publications, meta } = await this.paginationService.paginate(
      this.publicationRepository,
      paginationDto,
      {
        where: { is_active: true, user: { id: targetUserId, is_active: true } },
        relations: ['user', 'files'],
        select: {
          id: true,
          title: true,
          description: true,
          tag: true,
          category: true,
          files: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );

    if (publications.length === 0) {
      throw new NotFoundException('No publications found for the given user');
    }

    return {
      data: publications,
      meta,
    };
  }

  async filterPublicationsByCategory(
    category: categoryTag,
    paginationDto: PaginationDto,
  ) {
    const { data: publications, meta } = await this.paginationService.paginate(
      this.publicationRepository,
      paginationDto,
      {
        where: { is_active: true, category, user: { is_active: true } },
        relations: ['user', 'files'],
        select: {
          id: true,
          title: true,
          description: true,
          tag: true,
          category: true,
          files: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );

    if (publications.length === 0) {
      throw new NotFoundException(
        'No publications found for the given category',
      );
    }

    return {
      data: publications,
      meta,
    };
  }

  // sendUserChat(id: number) {
  //   return `This action removes a #${id} publication`;
  // }

  // speakUserPublication(id: number) {
  //   return `This action removes a #${id} publication`;
  // }

  // Private Methods

  private async checkForPricesAndDeactivateUser(
    createPublicationDto: Partial<CreatePublicationDto>,
    updatePublicationDto: Partial<UpdatePublicationDto>,
    user: User,
  ) {
    const pricePattern =
      /\$\d+(\.\d{1,2})?|USD \d+(\.\d{1,2})?|€ \d+(\.\d{1,2})?/;

    const titleContainsPrice =
      createPublicationDto.title &&
      pricePattern.test(createPublicationDto.title);
    const descriptionContainsPrice =
      createPublicationDto.description &&
      pricePattern.test(createPublicationDto.description);
    const titleContainsPriceUpdate =
      updatePublicationDto.title &&
      pricePattern.test(updatePublicationDto.title);
    const descriptionContainsPriceUpdate =
      updatePublicationDto.description &&
      pricePattern.test(updatePublicationDto.description);

    const containsPenalizedWords = (text: string) =>
      penalizedWords.some((word) => text.toLowerCase().includes(word));

    const titleHasPenalizedWords =
      createPublicationDto.title &&
      containsPenalizedWords(createPublicationDto.title);
    const descriptionHasPenalizedWords =
      createPublicationDto.description &&
      containsPenalizedWords(createPublicationDto.description);
    const titleHasPenalizedWordsUpdate =
      updatePublicationDto.title &&
      containsPenalizedWords(updatePublicationDto.title);
    const descriptionHasPenalizedWordsUpdate =
      updatePublicationDto.description &&
      containsPenalizedWords(updatePublicationDto.description);

    if (
      titleContainsPrice ||
      descriptionContainsPrice ||
      titleContainsPriceUpdate ||
      descriptionContainsPriceUpdate ||
      titleHasPenalizedWords ||
      descriptionHasPenalizedWords ||
      titleHasPenalizedWordsUpdate ||
      descriptionHasPenalizedWordsUpdate
    ) {
      user.is_active = false;
      await this.userRepository.save(user);
      console.log(
        `Desactivado el usuario ${user.id} debido a contenido prohibido en la publicación.`,
      );
      throw new BadRequestException(
        'El usuario ha sido desactivado debido a contenido prohibido en la publicación.',
      );
    }
  }
}
