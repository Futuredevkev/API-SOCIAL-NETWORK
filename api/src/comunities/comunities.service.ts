import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateComunityDto } from './dto/create-comunity.dto';
import { UpdateComunityDto } from './dto/update-comunity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Community } from './entities/comunity.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaymentsService } from 'src/payments/payments.service';
import { FileCommunity } from './entities/file.comunities.entity';
import { StatusPay } from 'src/enums/enum-status-pay';
import { OrdersService } from 'src/orders/orders.service';
import { CommunityRoles } from 'src/enums/enum.communities.roles';
import { UserCommunity } from './entities/user.community.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CensorService } from 'src/globalMethods/censor.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { createRoleDto } from './dto/create-role.dto';


@Injectable()
export class ComunitiesService {
  constructor(
    @InjectRepository(Community)
    private readonly comunityRepository: Repository<Community>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCommunity)
    private readonly userCommunityRepository: Repository<UserCommunity>,
    private readonly paginationService: PaginationService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  // Community

  async initiatePayment(
    initiatePaymentDto: InitiatePaymentDto,
    userId: string,
  ) {
    const { method, email } = initiatePaymentDto;

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      relations: ['orders'],
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const hasApprovedOrder = await this.ordersService.hasRecentApprovedOrder(
      userAuth.id,
    );

    if (hasApprovedOrder) {
      throw new BadRequestException('Ya has pagado la comunidad');
    }

    const payment = await this.paymentsService.createPayment(userAuth.id, {
      method: method,
      email: email,
    });

    if (payment.approvalUrl) {
      return {
        url: payment.approvalUrl,
        message: 'Please complete the payment to create the community.',
      };
    }

    throw new BadRequestException('Failed to initiate payment');
  }

  async completeCommunityCreation(
    createComunityDto: CreateComunityDto,
    userId: string,
    image: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { description, title } = createComunityDto;

      const userAuth = await queryRunner.manager.findOne(User, {
        where: { id: userId, is_active: true },
      });

      if (!userAuth) {
        throw new BadRequestException('User not found');
      }

      const orderStatus = await this.ordersService.getOrderStatus(userAuth.id);

      if (orderStatus !== StatusPay.APPROVED) {
        throw new BadRequestException('Payment not approved');
      }

      const imageCommunity = await this.cloudinaryService.uploadFile(
        image.buffer,
        'groupExpand',
      );

      if (!imageCommunity || !imageCommunity.url) {
        throw new BadRequestException('No image provided');
      }

      const fileCommunity = queryRunner.manager.create(FileCommunity, {
        url: imageCommunity.url,
      });

      const censoredTitle = CensorService.censorProfanity(
        createComunityDto.title,
      );
      const censoredDescription = CensorService.censorProfanity(
        createComunityDto.description,
      );

      const comunity = queryRunner.manager.create(Community, {
        title: censoredTitle || title,
        description: censoredDescription || description,
        user: userAuth,
        file: fileCommunity,
      });

      await queryRunner.manager.save(comunity);

      const userCommunity = queryRunner.manager.create(UserCommunity, {
        user: userAuth,
        community: comunity,
        role: CommunityRoles.ADMINGROUP,
      });

      await queryRunner.manager.save(userCommunity);

      await queryRunner.commitTransaction();
      return {
        message: 'Community created successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCommunity(
    userId: string,
    communityId: string,
    image: Express.Multer.File,
    updateComunityDto: UpdateComunityDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();

    const { description, title } = updateComunityDto;

    try {
      const userAuth = await queryRunner.manager.findOne(User, {
        where: { id: userId, is_active: true },
      });

      if (!userAuth) {
        throw new BadRequestException('User not found');
      }

      const isAdminOrHelper = await this.userIsAdminOrHelper(
        userAuth.id,
        communityId,
      );
      if (!isAdminOrHelper) {
        throw new BadRequestException(
          'You do not have permission to update this community',
        );
      }

      const community = await queryRunner.manager.findOne(Community, {
        where: { id: communityId, is_active: true },
        relations: ['user'],
      });

      if (!community) {
        throw new BadRequestException('Community not found');
      }

      if (community.user.id !== userAuth.id) {
        throw new BadRequestException('You can not update this community');
      }

      let newImageUrl: string | null = null;

      if (image) {
        if (community.file) {
          await queryRunner.manager.delete(FileCommunity, community.file.id);
        }

        const uploadedImage = await this.cloudinaryService.uploadFile(
          image.buffer,
          'groupExpand',
        );
        newImageUrl = uploadedImage.url;
      }

      let censoredTitle: string | undefined = title;
      let censoredDescription: string | undefined = description;

      if (title) {
        censoredTitle = CensorService.censorProfanity(title);
      }

      if (description) {
        censoredDescription = CensorService.censorProfanity(description);
      }

      const updatedCommunity = await queryRunner.manager.preload(Community, {
        id: community.id,
        title: censoredTitle || title,
        description: censoredDescription || description,
        file: {
          url: newImageUrl,
        },
      });

      await queryRunner.manager.save(updatedCommunity);
      await queryRunner.commitTransaction();

      return {
        message: 'Community updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeCommunity(userId: string, communityId: string) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const isAdminOrHelper = await this.userIsAdminOrHelper(
      authUser.id,
      communityId,
    );
    if (!isAdminOrHelper) {
      throw new BadRequestException(
        'You do not have permission to delete this community',
      );
    }

    const community = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    if (community.user.id !== authUser.id) {
      throw new BadRequestException('You can not delete this community');
    }

    const deletedCommunity = await this.comunityRepository.preload({
      ...community,
      is_active: false,
    });

    await this.comunityRepository.save(deletedCommunity);

    return {
      message: 'Community deleted successfully',
    };
  }

  //Users in community

  async addUserToCommunity(
    userId: string,
    communityId: string,
    userTargetId: string,
  ) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    console.log('authUser:', authUser);

    const community = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    console.log('User Communities:', community.userCommunities);

    const foundUser = community.userCommunities.find(
      (user) => user.user.id === authUser.id,
    );
    if (
      !foundUser ||
      (foundUser.role !== CommunityRoles.ADMINGROUP &&
        foundUser.role !== CommunityRoles.HELPERGROUP)
    ) {
      throw new BadRequestException(
        'No puedes agregar usuarios a esta comunidad',
      );
    }

    console.log('found user', foundUser);

    const userTarget = await this.userRepository.findOne({
      where: { id: userTargetId, is_active: true },
    });

    if (!userTarget) {
      throw new BadRequestException('User not found');
    }

    if (
      community.userCommunities.find((user) => user.user.id === userTarget.id)
    ) {
      throw new BadRequestException('User already in this community');
    }

    const userCommunity = await this.userCommunityRepository.create({
      user: userTarget,
      community: community,
    });

    await this.userCommunityRepository.save(userCommunity);

    return {
      message: 'User added to community',
    };
  }

  async allCommunities(paginationDto: PaginationDto) {
    const comunities = await this.paginationService.paginate(
      this.comunityRepository,
      paginationDto,
      {
        where: { is_active: true, user: { is_active: true } },
        relations: ['userCommunities', 'user', 'file'],
        select: {
          created_at: true,
          description: true,
          events: true,
          file: {
            url: true,
          },
          publications: true,
          title: true,
          userCommunities: true,
          user: {
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );

    if (!comunities?.data.length) {
      throw new BadRequestException('Communities not found');
    }

    return {
      data: comunities.data,
      meta: comunities.meta,
    };
  }

  async allCommunitiesByUser(userId: string, paginationDto: PaginationDto) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const comunities = await this.paginationService.paginate(
      this.comunityRepository,
      paginationDto,
      {
        where: { is_active: true, user: { id: authUser.id, is_active: true } },
        relations: ['userCommunities', 'user', 'file'],
        select: {
          created_at: true,
          description: true,
          events: true,
          file: {
            url: true,
          },
          publications: true,
          title: true,
          userCommunities: true,
          user: {
            name: true,
            lastname: true,
            file: {
              url: true,
            },
          },
        },
      },
    );

    if (!comunities?.data.length) {
      throw new BadRequestException('Communities not found');
    }

    return {
      data: comunities.data,
      meta: comunities.meta,
    };
  }

  async getCommunityById(communityId: string) {
    const community = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true, user: { is_active: true } },
      relations: ['userCommunities', 'user', 'file'],
      select: {
        created_at: true,
        description: true,
        events: true,
        file: {
          url: true,
        },
        publications: true,
        title: true,
        userCommunities: true,
        user: {
          name: true,
          lastname: true,
          file: {
            url: true,
          },
        },
      },
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    return community;
  }

  async removeUserToComunity(
    userId: string,
    communityId: string,
    userTargetId: number,
  ) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const community = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const foundUserCommunity = community.userCommunities.find(
      (userCommunity) => userCommunity.user.id === authUser.id,
    );

    if (
      !foundUserCommunity ||
      (foundUserCommunity.role !== CommunityRoles.ADMINGROUP &&
        foundUserCommunity.role !== CommunityRoles.HELPERGROUP)
    ) {
      throw new BadRequestException(
        'You can not remove users from this community',
      );
    }

    const userTarget = await this.userCommunityRepository.findOne({
      where: { id: userTargetId },
    });

    if (!userTarget) {
      throw new BadRequestException('User not found');
    }

    await this.userCommunityRepository.remove(userTarget);

    return {
      message: 'User removed from community',
    };
  }

  async leaveCommunity(userId: string, communityId: string) {
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

      const community = await queryRunner.manager.findOne(Community, {
        where: { id: communityId, is_active: true },
        relations: ['userCommunities', 'userCommunities.user'],
      });

      if (!community) {
        throw new BadRequestException('Community not found');
      }

      const userCommunity = community.userCommunities.find(
        (uc) => uc.user.id === userAuth.id,
      );

      if (!userCommunity) {
        throw new BadRequestException('User is not a member of this community');
      }

     
      if (
        userCommunity.role === CommunityRoles.ADMINGROUP &&
        community.user.id === userAuth.id
      ) {
        throw new BadRequestException('Main admin cannot leave the community');
      }

      await queryRunner.manager.remove(userCommunity);
      
      await queryRunner.commitTransaction();

      return {
        message: 'Successfully left the community',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addRoleToUser(
    userId: string,
    communityId: string,
    userTargetId: number,
    createRoleDto: createRoleDto,
  ) {
    const { role } = createRoleDto;

    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const comunity = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!comunity) {
      throw new BadRequestException('Community not found');
    }

    if (
      comunity.userCommunities.find((user) => user.user.id === authUser.id)
        .role !== CommunityRoles.ADMINGROUP
    ) {
      throw new BadRequestException(
        'You can not add role to users in this community',
      );
    }

    console.log('target');

    const userTarget = await this.userCommunityRepository.findOne({
      where: { id: userTargetId },
    });

    if (!userTarget) {
      throw new BadRequestException('User not found');
    }

    const userCommunity = await this.userCommunityRepository.preload({
      ...userTarget,
      role: role,
    });

    await this.userCommunityRepository.save(userCommunity);

    return {
      message: 'Role added to user',
    };
  }

  async findUsersOfCommunity(
    userId: string,
    communityId: string,
    role: CommunityRoles,
    paginationDto: PaginationDto,
  ) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const community = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true, user: { is_active: true } },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const isUserInCommunity = community.userCommunities.some(
      (user) => user.user.id === authUser.id,
    );

    if (!isUserInCommunity) {
      throw new BadRequestException('User not in community');
    }

    const users = community.userCommunities
      .filter((userCommunity) => userCommunity.role === role)
      .map((userCommunity) => ({
        id: userCommunity.user.id,
        name: userCommunity.user.name,
        lastname: userCommunity.user.lastname,
        profilePicture: userCommunity.user.file
          ? userCommunity.user.file.url
          : null,
      }));

    const { page, limit } = paginationDto;
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      data: paginatedUsers,
      meta: {
        lastPage: Math.ceil(users.length / limit),
        offset: offset,
        totalItems: users.length,
      },
    };
  }

  async findAdminsOfCommunity(
    userId: string,
    communityId: string,
    paginationDto: PaginationDto,
  ) {
    return this.findUsersOfCommunity(
      userId,
      communityId,
      CommunityRoles.ADMINGROUP,
      paginationDto,
    );
  }

  async findHelpersOfCommunity(
    communityId: string,
    paginationDto: PaginationDto,
    userId: string,
  ) {
    return this.findUsersOfCommunity(
      userId,
      communityId,
      CommunityRoles.HELPERGROUP,
      paginationDto,
    );
  }

  async findMembersOfCommunity(
    communityId: string,
    paginationDto: PaginationDto,
    userId: string,
  ) {
    return this.findUsersOfCommunity(
      userId,
      communityId,
      CommunityRoles.MEMBERGROUP,
      paginationDto,
    );
  }

  async findAllUsersOfCommunity(
    userId: string,
    communityId: string,
    paginationDto: PaginationDto,
  ) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    console.log('Authenticated User:', authUser);

    if (!authUser) {
      throw new BadRequestException('User not found');
    }

    const community = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true, user: { is_active: true } },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const isUserInCommunity = community.userCommunities.some(
      (userCommunity) => userCommunity.user.id === authUser.id,
    );

    if (!isUserInCommunity) {
      throw new BadRequestException('User not in community');
    }

    const users = community.userCommunities.map((userCommunity) => ({
      id: userCommunity.user.id,
      name: userCommunity.user.name,
      lastname: userCommunity.user.lastname,
      profilePicture: userCommunity.user.file
        ? userCommunity.user.file.url
        : null,
    }));

    const { page, limit } = paginationDto;
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);

    console.log('Pagination Meta:', {
      lastPage: Math.ceil(users.length / limit),
      offset: offset,
      totalItems: users.length,
    });

    return {
      data: paginatedUsers,
      meta: {
        lastPage: Math.ceil(users.length / limit),
        offset: offset,
        totalItems: users.length,
      },
    };
  }

  private async userIsAdminOrHelper(
    userId: string,
    communityId: string,
  ): Promise<boolean> {
    const community = await this.comunityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities'],
    });

    if (!community) return false;

    const userCommunity = community.userCommunities.find(
      (uc) => uc.user.id === userId,
    );
    return (
      userCommunity &&
      (userCommunity.role === CommunityRoles.ADMINGROUP ||
        userCommunity.role === CommunityRoles.HELPERGROUP)
    );
  }
}
