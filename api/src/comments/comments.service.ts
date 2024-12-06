import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { Publication } from 'src/publication/entities/publication.entity';
import { User } from 'src/user/entities/user.entity';
import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FileComment } from './entities/file-comment.entity';
import { CensorService } from 'src/globalMethods/censor.service';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FileComment)
    private readonly fileCommentRepository: Repository<FileComment>,
    private readonly paginationService: PaginationService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async createComment(
    userId: string,
    publicationId: string,
    createCommentDto: CreateCommentDto,
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

      const publication = await this.publicationRepository.findOne({
        where: { id: publicationId, is_active: true },
        relations: ['user'],
      });

      if (!publication) {
        throw new BadRequestException('Publication not found');
      }

      let fileComment: FileComment | null = null;

      if (image) {
        const imageComment = await this.cloudinaryService.uploadFile(
          image.buffer,
          'comment',
        );

        if (!imageComment || !imageComment.url) {
          throw new BadRequestException('No image provided');
        }

        fileComment = queryRunner.manager.create(FileComment, {
          url: imageComment.url,
        });
      }

      const censoredContent = CensorService.censorProfanity(
        createCommentDto.content,
      );

      const comment = queryRunner.manager.create(Comment, {
        ...createCommentDto,
        content: censoredContent || createCommentDto.content,
        user: userAuth,
        publication,
        file: fileComment,
      });

      await queryRunner.manager.save(comment);

      await queryRunner.commitTransaction();

      return { message: 'Comment created successfully' };
    } catch (error) {
      console.error('Error:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const allComments = this.paginationService.paginate(
      this.commentRepository,
      paginationDto,
      {
        where: { is_active: true, user: { is_active: true } },
        relations: ['user', 'file'],
        select: {
          content: true,
          file: {
            url: true,
          },
          id: true,
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

    if (!allComments) {
      throw new BadRequestException('Comments not found');
    }

    return allComments;
  }

  async findOne(id: string) {
    const comment = this.commentRepository.findOne({
      where: { id, is_active: true, user: { is_active: true } },
      relations: ['user', 'file'],
      select: {
        content: true,
        file: {
          url: true,
        },
        id: true,
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

    if (!comment) {
      throw new BadRequestException('Comment not found');
    }

    return comment;
  }

  async findCommentsByPublication(
    publicationId: string,
    paginationDto: PaginationDto,
  ) {
    const allCommentsPublication = this.paginationService.paginate(
      this.commentRepository,
      paginationDto,
      {
        where: {
          publication: { id: publicationId },
          is_active: true,
          user: { is_active: true },
        },
        relations: ['user', 'file'],
        select: {
          content: true,
          file: {
            url: true,
          },
          id: true,
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

    if (!allCommentsPublication) {
      throw new BadRequestException('Comments not found');
    }

    return allCommentsPublication;
  }

  async findCommentsByUser(userId: string, paginationDto: PaginationDto) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const allCommentsUser = this.paginationService.paginate(
      this.commentRepository,
      paginationDto,
      {
        where: { user: { id: authUser.id, is_active: true }, is_active: true },
        relations: ['user', 'file'],
        select: {
          content: true,
          file: {
            url: true,
          },
          id: true,
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

    if (!allCommentsUser) {
      throw new BadRequestException('Comments not found');
    }

    return allCommentsUser;
  }

  async update(
    userId: string,
    publicationId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    image: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { content } = updateCommentDto;

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
        relations: ['user', 'file'],
      });

      if (!comment) {
        throw new BadRequestException('Comment not found');
      }

      if (comment.user.id !== userAuth.id) {
        throw new BadRequestException('You cannot edit this comment');
      }

      let newImageUrl: string | null = null;

      if (image) {
        if (comment.file) {
          await queryRunner.manager.delete(FileComment, comment.file.id);
        }

        const uploadedImage = await this.cloudinaryService.uploadFile(
          image.buffer,
          'comment',
        );
        newImageUrl = uploadedImage.url;
      }

      let censoredContent: string | undefined = content;

      if (content) {
        censoredContent = CensorService.censorProfanity(
          updateCommentDto.content,
        );
      }

      if (comment.file) {
        comment.file.url = newImageUrl;
        await queryRunner.manager.save(comment.file);
      } else {
        const fileComment = new FileComment();
        fileComment.url = newImageUrl;
        comment.file = fileComment;
        await queryRunner.manager.save(fileComment);
      }

      await queryRunner.manager.save(comment);
      await queryRunner.commitTransaction();

      return { message: 'Comment updated' };
    } catch (error) {
      console.error('Error:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async remove(userId: string, publicationId: string, commentId: string) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId, is_active: true },
      relations: ['user'],
    });

    if (!publication) {
      throw new BadRequestException('Publication not found');
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, is_active: true },
      relations: ['user', 'file'],
    });

    if (!comment) {
      throw new BadRequestException('Comment not found');
    }

    if (comment.user.id !== authUser.id) {
      throw new BadRequestException('You can not delete this comment');
    }

    await this.commentRepository.update(
      { id: commentId },
      { is_active: false },
    );

    if (comment.file) {
      await this.fileCommentRepository.update(
        { id: comment.file.id },
        { is_active: false },
      );
    }

    return {
      message: 'Comment deleted successfully',
    };
  }
}
