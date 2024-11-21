import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NeedLike } from './entities/needLike.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChangeLike } from './entities/changeLike.entity';
import { Publication } from 'src/publication/entities/publication.entity';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(NeedLike)
    private readonly needLikeRepository: Repository<NeedLike>,
    @InjectRepository(ChangeLike)
    private readonly changeLikeRepository: Repository<ChangeLike>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async needLike(userId: string, publicationId: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId },
    });

    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId },
      relations: ['user'],
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    if (!publication) {
      throw new BadRequestException('Publication not found');
    }

    const needLike = this.needLikeRepository.create({
      user: userAuth,
      publication,
    });

    if (needLike.user.id === needLike.publication.user.id) {
      throw new BadRequestException('You can not like your own publication');
    }

    const needLikeExist = await this.needLikeRepository.findOne({
      where: {
        user: { id: userAuth.id },
        publication: { id: publicationId },
      },
    });

    if (needLikeExist) {
      throw new BadRequestException('You already liked this publication');
    }

    await this.needLikeRepository.save(needLike);


    return { message: 'Need Like created' };
  }

  async changeLike(userId: string, publicationId: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId },
    });

    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId },
      relations: ['user'],
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    if (!publication) {
      throw new BadRequestException('Publication not found');
    }

    const changeLike = this.changeLikeRepository.create({
      user: userAuth,
      publication,
    });

    if (changeLike.user.id === changeLike.publication.user.id) {
      throw new BadRequestException('You can not like your own publication');
    }

    const changeLikeExist = await this.changeLikeRepository.findOne({
      where: {
        user: { id: userAuth.id },
        publication: { id: publicationId },
      },
    });

    if (changeLikeExist) {
      throw new BadRequestException('You already liked this publication');
    }

    await this.changeLikeRepository.save(changeLike);

    return { message: 'Change Like created' };
  }

  async removeNeedLike(userId: string, needLikeId: number) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const needLike = await this.needLikeRepository.findOne({
      where: { id: needLikeId },
      relations: ['user'],
    });

    if (!needLike) {
      throw new BadRequestException('Need Like not found');
    }

    if (needLike.user.id !== userAuth.id) {
      throw new BadRequestException('Need Like not belong to the user');
    }

    await this.needLikeRepository.remove(needLike);

    return { message: 'Need Like removed' };
  }

  async removeChangeLike(userId: string, changeLikeId: number) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const changeLike = await this.changeLikeRepository.findOne({
      where: { id: changeLikeId },
      relations: ['user'],
    });

    if (!changeLike) {
      throw new BadRequestException('Change Like not found');
    }

    if (changeLike.user.id !== userAuth.id) {
      throw new BadRequestException('Change Like not belong to the user');
    }

    await this.changeLikeRepository.remove(changeLike);

    return { message: 'Change Like removed' };
  }

  async showNeedsLikePublication(publicationId: string) {
    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId, user: { is_active: true } },
      relations: ['needLikes', 'needLikes.user', 'files', 'user'],
    });

    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    const usersWhoNeedLikes = publication.needLikes.map((needLike) => {
      return {
        userName: needLike.user.name,
        userPhoto: needLike.user.file,
      };
    });

    return {
      publicationId,
      usersWhoNeedLikes,
    };
  }

  async showChangeLikesPublication(publicationId: string) {
    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId, user: { is_active: true } },
      relations: ['changeLikes', 'changeLikes.user', 'files', 'user'],
    });

    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    const usersWhoChangeLikes = publication.changeLikes.map((changeLike) => {
      return {
        userName: changeLike.user.name,
        userPhoto: changeLike.user.file,
      };
    });

    return {
      publicationId,
      usersWhoChangeLikes,
    };
  }
}
