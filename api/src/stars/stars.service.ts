import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStarDto } from './dto/create-star.dto';
import { UpdateStarDto } from './dto/update-star.dto';
import { Star } from './entities/star.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class StarsService {
  constructor(
    @InjectRepository(Star)
    private readonly starsRepository: Repository<Star>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async addPointsUser(
    createStarDto: CreateStarDto,
    userId: string,
    targerUserId: string,
  ) {
    const authUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!authUser) {
      throw new NotFoundException('User not found');
    }

    const targetUser = await this.usersRepository.findOne({
      where: { id: targerUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User vote not found');
    }

    if (authUser.id === targetUser.id) {
      throw new ForbiddenException('You can not vote for yourself');
    }

    const existingStar = await this.starsRepository.findOne({
      where: { user: targetUser },
    });

    if (existingStar) {
      throw new ForbiddenException('User already voted');
    }

    const star = this.starsRepository.create({
      ...createStarDto,
      user: targetUser,
    });

    await this.starsRepository.save(star);

    return { message: 'Star created' };
  }

  async updatePointsUser(
    updateStarDto: UpdateStarDto,
    userId: string,
    targetUserId: string,
    starId: number,
  ) {
    const authUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!authUser) {
      throw new NotFoundException('User not found');
    }

    const targetUser = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User vote not found');
    }

    if (authUser.id === targetUser.id) {
      throw new ForbiddenException('You can not vote for yourself');
    }

    const star = await this.starsRepository.findOne({
      where: { id: starId, user: targetUser },
    });

    if (!star) {
      throw new NotFoundException('Star not found');
    }

    const updatedStar = this.starsRepository.merge(star, updateStarDto);

    await this.starsRepository.save(updatedStar);

    return { message: 'Star updated' };
  }

  async removePointsUser(userId: string, targetUserId: string, starId: number) {
    const authUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!authUser) {
      throw new NotFoundException('User not found');
    }

    const targetUser = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User vote not found');
    }

    if (authUser.id === targetUser.id) {
      throw new ForbiddenException('You can not vote for yourself');
    }

    const star = await this.starsRepository.findOne({
      where: { id: starId, user: targetUser },
      relations: ['user'],
    });

    if (!star) {
      throw new NotFoundException('Star not found');
    }

    if (star.user.id !== targetUser.id) {
      throw new ForbiddenException(
        'This star does not belong to the target user',
      );
    }

    await this.starsRepository.remove(star);

    return { message: 'Star removed' };
  }

  async getPointsStats(
    userId: string,
    forUserId?: string,
  ): Promise<{
    totalAssignedStars: number;
    averageAssignedStars: number;
    totalReceivedStars: number;
    averageReceivedStars: number;
    starsGivenByUsers: { user: User; stars: number }[];
  }> {
    const assignedStarsResult = await this.starsRepository
      .createQueryBuilder('star')
      .select('SUM(star.stars)', 'totalAssignedStars')
      .addSelect('COUNT(star.id)', 'totalAssignments')
      .where('star.userId = :userId', { userId })
      .getRawOne();

    const totalAssignedStars = assignedStarsResult.totalAssignedStars
      ? parseFloat(assignedStarsResult.totalAssignedStars)
      : 0;
    const totalAssignments = assignedStarsResult.totalAssignments
      ? parseInt(assignedStarsResult.totalAssignments, 10)
      : 0;

    const averageAssignedStars =
      totalAssignments > 0 ? totalAssignedStars / totalAssignments : 0;

    const receivedStarsResult = await this.starsRepository
      .createQueryBuilder('star')
      .select('SUM(star.stars)', 'totalReceivedStars')
      .addSelect('COUNT(star.id)', 'totalReceipts')
      .where('star.userId = :forUserId', { forUserId: forUserId || userId })
      .getRawOne();

    const totalReceivedStars = receivedStarsResult.totalReceivedStars
      ? parseFloat(receivedStarsResult.totalReceivedStars)
      : 0;
    const totalReceipts = receivedStarsResult.totalReceipts
      ? parseInt(receivedStarsResult.totalReceipts, 10)
      : 1;

    const averageReceivedStars =
      totalReceipts > 0 ? totalReceivedStars / totalReceipts : 0;

    const starsGivenByUsers = await this.starsRepository
      .createQueryBuilder('star')
      .select('star.userId', 'userId')
      .addSelect('SUM(star.stars)', 'totalStars')
      .where('star.userId != :forUserId', { forUserId: forUserId || userId })
      .groupBy('star.userId')
      .getRawMany();

    const usersWithStars = await Promise.all(
      starsGivenByUsers.map(async (star) => {
        const user = await this.usersRepository.findOne({
          where: { id: star.userId },
        });

        return { user, stars: parseFloat(star.totalStars) };
      }),
    );

    return {
      totalAssignedStars,
      averageAssignedStars,
      totalReceivedStars,
      averageReceivedStars,
      starsGivenByUsers: usersWithStars,
    };
  }
}
