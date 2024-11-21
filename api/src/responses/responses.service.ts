import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Response } from './entities/response.entity';
import { User } from 'src/user/entities/user.entity';
import { FileResponse } from './entities/file-response.entity';
import { Publication } from 'src/publication/entities/publication.entity';
import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CensorService } from 'src/globalMethods/censor.service';


@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Response)
    private readonly responseRepository: Repository<Response>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FileResponse)
    private readonly fileResponseRepository: Repository<FileResponse>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    private readonly paginationService: PaginationService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async createResponse(
    userId: string,
    publicationId: string,
    commentId: string,
    createResponseDto: CreateResponseDto,
    image?: Express.Multer.File,
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

      const publication = await queryRunner.manager.findOne(Publication, {
        where: { id: publicationId, is_active: true },
      });

      if (!publication) {
        throw new BadRequestException('Publication not found');
      }

      const comment = await queryRunner.manager.findOne(Comment, {
        where: { id: commentId, is_active: true },
      });

      if (!comment) {
        throw new BadRequestException('Comment not found');
      }

      let fileResponse: FileResponse | null = null;

     
      if (image) {
        const imageResponse = await this.cloudinaryService.uploadFile(
          image.buffer,
          'responses',
        );

        if (!imageResponse || !imageResponse.url) {
          throw new BadRequestException('Failed to upload image');
        }

        fileResponse = queryRunner.manager.create(FileResponse, {
          url: imageResponse.url,
        });
      }

      const censoredContent = CensorService.censorProfanity(
        createResponseDto.content,
      );

      const response = queryRunner.manager.create(Response, {
        ...createResponseDto,
        content: censoredContent || createResponseDto.content,
        user: userAuth,
        publication: publication,
        comment: comment,
        file: fileResponse, 
      });

      await queryRunner.manager.save(response);


      await queryRunner.commitTransaction();

      return { message: 'Response created successfully' };
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to create response');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const allResponses = this.paginationService.paginate(
      this.responseRepository,
      paginationDto,
      {
        where: { is_active: true, user: { is_active: true } },
        relations: ['user', 'comment', 'file'],
        select: {
          content: true,
          file: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
            comments: {
              id: true,
              content: true,
            },
          },
        },
      },
    );

    if (!allResponses) {
      throw new BadRequestException('No responses found');
    }

    return allResponses;
  }

  async findOne(id: string) {
    const response = await this.responseRepository.findOne({
      where: { id, is_active: true, user: { is_active: true } },
      relations: ['user', 'comment', 'file'],
      select: {
        content: true,
        file: {
          url: true,
        },
        user: {
          id: true,
          name: true,
          lastname: true,
          file: {
            url: true,
          },
          comments: {
            id: true,
            content: true,
          },
        },
      },
    });

    if (!response) {
      throw new BadRequestException('Response not found');
    }

    return response;
  }

  async findResponseByUser(userId: string, paginationDto: PaginationDto) {
    const authUserr = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUserr) {
      throw new BadRequestException('User not found');
    }

    const allResponsesUser = this.paginationService.paginate(
      this.responseRepository,
      paginationDto,
      {
        where: { user: { id: userId, is_active: true }, is_active: true },
        relations: ['user', 'comment', 'file'],
        select: {
          content: true,
          file: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
            comments: {
              id: true,
              content: true,
            },
          },
        },
      },
    );

    if (!allResponsesUser) {
      throw new BadRequestException('No responses found');
    }

    return allResponsesUser;
  }

  async findResponseByComment(commentId: string, paginationDto: PaginationDto) {
    const allResponsesComment = this.paginationService.paginate(
      this.responseRepository,
      paginationDto,
      {
        where: {
          comment: { id: commentId },
          is_active: true,
          user: { is_active: true },
        },
        relations: ['user', 'comment', 'file'],
        select: {
          content: true,
          file: {
            url: true,
          },
          user: {
            id: true,
            name: true,
            lastname: true,
            file: {
              url: true,
            },
            comments: {
              id: true,
              content: true,
            },
          },
        },
      },
    );

    if (!allResponsesComment) {
      throw new BadRequestException('No responses found');
    }

    return allResponsesComment;
  }

  async update(
    userId: string,
    publicationId: string,
    commentId: string,
    responseId: string,
    updateResponseDto: UpdateResponseDto,
    image?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { content } = updateResponseDto;

    try {
      const userAuth = await queryRunner.manager.findOne(User, {
        where: { id: userId, is_active: true },
      });

      if (!userAuth) {
        throw new BadRequestException('User not found');
      }

      const publication = await queryRunner.manager.findOne(Publication, {
        where: { id: publicationId, is_active: true },
      });

      if (!publication) {
        throw new BadRequestException('Publication not found');
      }

      const comment = await queryRunner.manager.findOne(Comment, {
        where: { id: commentId, is_active: true },
      });

      if (!comment) {
        throw new BadRequestException('Comment not found');
      }

      const response = await queryRunner.manager.findOne(Response, {
        where: { id: responseId, is_active: true },
        relations: ['user', 'file'],
      });

      if (!response) {
        throw new BadRequestException('Response not found');
      }

      if (response.user.id !== userAuth.id) {
        throw new BadRequestException('You can not edit this response');
      }

      let newImageUrl: string | null = null;

      if (image) {
        const uploadedImage = await this.cloudinaryService.uploadFile(
          image.buffer,
          'responses',
        );

        newImageUrl = uploadedImage.url;

        if (response.file) {
          response.file.url = newImageUrl;
          await queryRunner.manager.save(response.file);
        } else {
          const fileResponse = new FileResponse();
          fileResponse.url = newImageUrl;
          response.file = fileResponse;
          await queryRunner.manager.save(fileResponse);
        }
      }

      let censoredContent: string | undefined = content;

      if (content) {
        censoredContent = CensorService.censorProfanity(
          updateResponseDto.content,
        );
      }

      await queryRunner.manager.save(response);
      await queryRunner.commitTransaction();

      return { message: 'Response updated successfully.' };
    } catch (error) {
      console.log('Error durante la actualización: ', error.message);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async remove(
    userId: string,
    publicationId: string,
    commentId: string,
    responseId: string,
  ) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId, is_active: true },
    });

    if (!publication) {
      throw new BadRequestException('Publication not found');
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, is_active: true },
    });

    if (!comment) {
      throw new BadRequestException('Comment not found');
    }

    const response = await this.responseRepository.findOne({
      where: { id: responseId, is_active: true },
      relations: ['user', 'file'],
    });

    if (!response) {
      throw new BadRequestException('Response not found');
    }

    if (response.user.id !== authUser.id) {
      throw new BadRequestException('You can not delete this response');
    }

    await this.responseRepository.update(
      { id: responseId },
      { is_active: false },
    );

    if (response.file) {
      await this.fileResponseRepository.update(
        { id: response.file.id },
        { is_active: false },
      );
    }

    return { message: 'Response deleted successfully.' };
  }
}
