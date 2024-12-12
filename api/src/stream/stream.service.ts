import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { Stream } from './entities/stream.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { StreamGateway } from 'src/ws-stream/ws-stream.gateway';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly streamGateway: StreamGateway,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async createStream(
    userId: string,
    data: CreateStreamDto,
    image: Express.Multer.File,
  ): Promise<Stream> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    let imagePreviewUrl = null;

    if (image) {
      const imagePreviewLive = await this.cloudinaryService.uploadFile(
        image.buffer,
        'stream-image-preview',
      );

      if (!imagePreviewLive || !imagePreviewLive.url) {
        throw new BadRequestException('Error uploading image preview');
      }

      imagePreviewUrl = imagePreviewLive.url;
    }

    const stream = this.streamRepository.create({
      ...data,
      streamKey: this.generateStreamKey(),
      user,
      isActive: false,
      finishedAt: null,
      previewImageUrl: imagePreviewUrl,
    });

    return this.streamRepository.save(stream);
  }

  async editStream(
    userId: string,
    data: UpdateStreamDto,
    streamId: string,
  ): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const stream = await this.streamRepository.findOne({
      where: { id: streamId, user },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with id ${streamId} not found`);
    }

    const updatedStream = await this.streamRepository.preload({
      id: stream.id,
      ...data,
    });

    if (!updatedStream) {
      throw new NotFoundException(`Stream with id ${streamId} not found`);
    }

    await this.streamRepository.save(updatedStream);

    return 'Stream successfully updated';
  }
  async getActiveStreams(): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${user.id} not found`);
    }

    const streams = await this.streamRepository.find({
      where: { isActive: true },
    });

    return {
      user: {
        name: user.name,
        surname: user.lastname,
        profilePicture: user.file.url ? user.file.url : null,
      },
      streams: streams.map(({ title, description, created_at, isActive }) => ({
        title,
        description,
        created_at,
        isActive,
      })),
    };
  }

  async getUserStreams(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      relations: ['file'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const streamsUser = await this.streamRepository.find({
      where: { user },
      order: { created_at: 'ASC' },
    });

    if (!streamsUser.length) {
      throw new NotFoundException(`User with id ${userId} has no streams`);
    }

    return {
      user: {
        name: user.name,
        surname: user.lastname,
        profilePicture: user.file.url ? user.file.url : null,
      },
      streams: streamsUser.map(
        ({ title, description, created_at, isActive, finishedAt }) => ({
          title,
          description,
          created_at,
          isActive,
          finishedAt,
        }),
      ),
    };
  }

  async validateStreamKey(userId: string, streamKey: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const stream = await this.streamRepository.findOne({
      where: { streamKey, user, isActive: false },
    });

    if (!stream) {
      throw new ForbiddenException(
        'Invalid stream key, stream not found, or already active',
      );
    }

    stream.isActive = true;
    await this.streamRepository.save(stream);

    this.streamGateway.handleStartStream({
      streamKey,
      userId,
      title: stream.title,
    });
  }

  async finishStream(userId: string, streamKey: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const stream = await this.streamRepository.findOne({
      where: { streamKey, user },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    const finishStream = await this.streamRepository.preload({
      id: stream.id,
      isActive: false,
      finishedAt: new Date(),
    });

    if (!finishStream) {
      throw new NotFoundException('Stream not found');
    }

    await this.streamRepository.save(finishStream);

    this.streamGateway.handleFinishStream({
      streamKey,
      userId,
      title: stream.title,
    });

    return 'Stream successfully finished';
  }

  private generateStreamKey(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
