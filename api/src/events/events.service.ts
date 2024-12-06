import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Community } from 'src/comunities/entities/comunity.entity';
import { FileEvent } from './entities/file.event.entity';
import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CommunityRoles } from 'src/enums/enum.communities.roles';
import { CensorService } from 'src/globalMethods/censor.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(FileEvent)
    private readonly fileEventRepository: Repository<FileEvent>,
    private readonly paginationService: PaginationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async createEvent(
    userId: string,
    communityId: string,
    createEventDto: CreateEventDto,
    image: Express.Multer.File,
  ) {
    const { address, city, description, title } = createEventDto;

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const community = await this.communityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const isUserInCommunity = community.userCommunities.some(
      (user) => user.user.id === userAuth.id,
    );

    if (!isUserInCommunity) {
      throw new BadRequestException('User not in community');
    }

    const foundUser = community.userCommunities.find(
      (user) => user.user.id === userAuth.id,
    );

    if (
      !foundUser ||
      (foundUser.role !== CommunityRoles.HELPERGROUP &&
        foundUser.role !== CommunityRoles.ADMINGROUP)
    ) {
      throw new BadRequestException('You dont have permission for this action');
    }

    const imageEvent = await this.cloudinaryService.uploadFile(
      image.buffer,
      'event',
    );

    if (!imageEvent || !imageEvent.url) {
      throw new BadRequestException('No image found');
    }

    const fileEvent = this.fileEventRepository.create({
      url: imageEvent.url,
    });

    const censoredTitle = CensorService.censorProfanity(createEventDto.title);

    const censoredDescription = CensorService.censorProfanity(
      createEventDto.description,
    );

    const censoredAddress = CensorService.censorProfanity(
      createEventDto.address,
    );

    const censoredCity = CensorService.censorProfanity(createEventDto.city);

    const event = this.eventRepository.create({
      ...createEventDto,
      title: censoredTitle || title,
      description: censoredDescription || description,
      address: censoredAddress || address,
      city: censoredCity || city,
      user: userAuth,
      community,
      file: fileEvent,
    });

    await this.eventRepository.save(event);

    return { message: 'Event created' };
  }

  async updateEvent(
    userId: string,
    communityId: string,
    eventId: string,
    image: Express.Multer.File,
    updateEventDto: UpdateEventDto,
  ) {
    const { address, city, description, title } = updateEventDto;

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const community = await this.communityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const isUserInCommunity = community.userCommunities.some(
      (user) => user.user.id === userAuth.id,
    );

    if (!isUserInCommunity) {
      throw new BadRequestException('User not in community');
    }

    const foundUser = community.userCommunities.find(
      (user) => user.user.id === userAuth.id,
    );

    if (
      !foundUser ||
      (foundUser.role !== CommunityRoles.HELPERGROUP &&
        foundUser.role !== CommunityRoles.ADMINGROUP)
    ) {
      throw new BadRequestException('You dont have permission for this action');
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId, is_active: true },
      relations: ['user', 'community', 'file'],
    });

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    let newImageUrl: string | null = null;

    if (image) {
      if (event.file) {
        await this.fileEventRepository.delete(event.file.id);
      }

      const uploadedImage = await this.cloudinaryService.uploadFile(
        image.buffer,
        'event',
      );
      newImageUrl = uploadedImage.url;
    }

    let censoredTitle: string | undefined = title;
    let censoredDescription: string | undefined = description;
    let censoredAddress: string | undefined = address;
    let censoredCity: string | undefined = city;

    if (title) {
      censoredTitle = CensorService.censorProfanity(title);
    }

    if (description) {
      censoredDescription = CensorService.censorProfanity(description);
    }

    if (address) {
      censoredAddress = CensorService.censorProfanity(address);
    }

    if (city) {
      censoredCity = CensorService.censorProfanity(city);
    }

    const updatedEvent = await this.eventRepository.preload({
      id: event.id,
      ...updateEventDto,
      title: censoredTitle || title,
      description: censoredDescription || description,
      address: censoredAddress || address,
      city: censoredCity || city,
      file: {
        url: newImageUrl,
      },
    });

    await this.eventRepository.save(updatedEvent);

    return { message: 'Event updated' };
  }

  async findAllCommunityEvents(
    userId: string,
    communityId: string,
    paginationDto: PaginationDto,
  ) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const community = await this.communityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const isUserInCommunity = community.userCommunities.some(
      (user) => user.user.id === userAuth.id,
    );

    if (!isUserInCommunity) {
      throw new BadRequestException('User not in community');
    }

    const events = await this.paginationService.paginate(
      this.eventRepository,
      paginationDto,
      {
        where: { is_active: true, user: { id: userAuth.id, is_active: true } },
        relations: ['user'],
        select: {
          address: true,
          city: true,
          description: true,
          file: {
            url: true,
          },
          title: true,
          start_date: true,
          end_date: true,
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

    if (!events) {
      throw new BadRequestException('Events not found');
    }

    return events;
  }

  async findDesactivatedCommunityEvents(
    userId: string,
    communityId: string,
    paginationDto: PaginationDto,
  ) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const community = await this.communityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const isUserInCommunity = community.userCommunities.some(
      (user) => user.user.id === userAuth.id,
    );

    if (!isUserInCommunity) {
      throw new BadRequestException('User not in community');
    }

    const events = await this.paginationService.paginate(
      this.eventRepository,
      paginationDto,
      {
        where: { is_active: false, user: { id: userAuth.id, is_active: true } },
        relations: ['user'],
        select: {
          address: true,
          city: true,
          description: true,
          file: {
            url: true,
          },
          title: true,
          start_date: true,
          end_date: true,
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

    if (!events) {
      throw new BadRequestException('Events not found');
    }

    return events;
  }

  async removeEvent(userId: string, communityId: string, eventId: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new BadRequestException('User not found');
    }

    const community = await this.communityRepository.findOne({
      where: { id: communityId, is_active: true },
      relations: ['userCommunities', 'userCommunities.user'],
    });

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    const isUserInCommunity = community.userCommunities.some(
      (user) => user.user.id === userAuth.id,
    );

    if (!isUserInCommunity) {
      throw new BadRequestException('User not in community');
    }

    const foundUser = community.userCommunities.find(
      (user) => user.user.id === userAuth.id,
    );

    if (
      !foundUser ||
      (foundUser.role !== CommunityRoles.HELPERGROUP &&
        foundUser.role !== CommunityRoles.ADMINGROUP)
    ) {
      throw new BadRequestException('You dont have permission for this action');
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId, is_active: true },
      relations: ['user', 'community'],
    });

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (event.community.id !== communityId) {
      throw new BadRequestException('Event not found');
    }

    if (event.user.id !== userAuth.id) {
      throw new BadRequestException(
        'you dont have permision for delete this event because you not create this event',
      );
    }

    const fileDeleted = await this.fileEventRepository.findOne({
      where: { event: { id: event.id } },
    });

    if (fileDeleted) {
      await this.fileEventRepository.preload({
        id: fileDeleted.id,
        is_active: false,
      });

      await this.fileEventRepository.save(fileDeleted);
    }

    const eventDeleted = await this.eventRepository.preload({
      id: event.id,
      is_active: false,
    });

    await this.eventRepository.save(eventDeleted);

    return {
      message: 'Event deleted successfully',
    };
  }
}
