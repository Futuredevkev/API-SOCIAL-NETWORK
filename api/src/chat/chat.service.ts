import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { DataSource, In, Raw, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Message } from './entities/messages.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileMessage } from './entities/fileMessage.entity';
import { LikeMessage } from './entities/likeMessage.entity';
import * as bcrypt from 'bcrypt';
import { PaginationChatService } from '../common/pagination-Chat.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationGateway } from 'src/ws-notifications/ws-notifications.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(FileMessage)
    private readonly fileMessageRepository: Repository<FileMessage>,
    @InjectRepository(LikeMessage)
    private readonly likeRepository: Repository<LikeMessage>,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
    private readonly paginationChatService: PaginationChatService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createChat(userId: string, receiverId: string): Promise<Chat> {
    const [sender, receiver] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new NotFoundException('One of the users was not found');
    }

    const existingChat = await this.chatRepository.findOne({
      where: [
        { sender: { id: sender.id }, receiver: { id: receiver.id } },
        { sender: { id: receiver.id }, receiver: { id: sender.id } },
      ],
    });

    if (existingChat) {
      throw new BadRequestException('Chat already exists');
    }

    const newChat = this.chatRepository.create({
      sender,
      receiver,
      messages: [],
      is_active: true,
    });

    return await this.chatRepository.save(newChat);
  }

  async sendMessage(
    chatId: string,
    userId: string,
    createChatDto: CreateChatDto,
    files: Express.Multer.File[],
  ): Promise<Message> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Inicio de la función sendMessage');

      const { content } = createChatDto;

      const chat = await queryRunner.manager.findOne(Chat, {
        where: { id: chatId, is_active: true },
        relations: ['sender', 'receiver'],
      });

      if (!chat) {
        throw new NotFoundException(`Chat with id ${chatId} not found`);
      }

      const sender = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!sender) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      if (chat.sender.id !== sender.id) {
        throw new UnauthorizedException(
          `You don't have permission to send a message in this chat`,
        );
      }

      const filesMessage = await Promise.all(
        files.map(async (file) => {
          let uploadFile;

          if (file.mimetype.startsWith('image/')) {
            uploadFile = await this.cloudinaryService.uploadFile(
              file.buffer,
              'messageFiles',
            );
          } else if (file.mimetype.startsWith('video/')) {
            uploadFile = await this.cloudinaryService.uploadFile(
              file.buffer,
              'video-message',
            );
          } else if (file.mimetype.startsWith('audio/')) {
            uploadFile = await this.cloudinaryService.uploadFile(
              file.buffer,
              'audio-message',
            );
          } else {
            throw new BadRequestException('Unsupported file type');
          }

          return queryRunner.manager.create(FileMessage, {
            url: uploadFile.url,
          });
        }),
      );

      const newMessage = queryRunner.manager.create(Message, {
        chat,
        sender,
        content,
        files: filesMessage,
        receiver: chat.receiver,
      });

      await this.messageRepository.save(newMessage);
      await queryRunner.commitTransaction();

      await this.notificationGateway.notifyNewMessage(
        chat.receiver.id,
        userId,
        chat.id,
        content,
      );

      return newMessage;
    } catch (error) {
      console.error('Error en sendMessage:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async editMessage(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
    chatId: string,
    files: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { ids_images } = updateMessageDto;

    try {
      let fileUploads: FileMessage[] = [];
      let filesInDb: FileMessage[] = [];

      const chat = await queryRunner.manager.findOne(Chat, {
        where: { id: chatId, is_active: true },
      });

      if (!chat) {
        throw new NotFoundException(`Chat with id ${chatId} not found`);
      }

      const message = await queryRunner.manager.findOne(Message, {
        where: { id: messageId, is_active: true },
        relations: ['sender', 'receiver', 'files'],
      });

      if (!message) {
        throw new NotFoundException(`Message with id ${messageId} not found`);
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      if (message.sender.id !== user.id) {
        throw new UnauthorizedException(
          `You don't have permission to edit this message`,
        );
      }

      if (ids_images && ids_images.length > 0) {
        filesInDb = await queryRunner.manager.find(FileMessage, {
          where: { id: In(ids_images) },
        });

        if (ids_images.length !== filesInDb.length) {
          throw new NotFoundException(`One of the images was not found`);
        }

        await Promise.all(
          filesInDb.map(async (file) => {
            await queryRunner.manager.delete(FileMessage, file.id);
          }),
        );
      }

      if (files && files.length > 0) {
        const uploads = await Promise.all(
          files.map(async (file) => {
            let uploadFile;

            if (file.mimetype.startsWith('image/')) {
              uploadFile = await this.cloudinaryService.uploadFile(
                file.buffer,
                'messageFiles',
              );
            } else if (file.mimetype.startsWith('video/')) {
              uploadFile = await this.cloudinaryService.uploadFile(
                file.buffer,
                'video-message',
              );
            } else if (file.mimetype.startsWith('audio/')) {
              uploadFile = await this.cloudinaryService.uploadFile(
                file.buffer,
                'audio-message',
              );
            } else {
              throw new BadRequestException('Unsupported file type');
            }

            const fileMessage = queryRunner.manager.create(FileMessage, {
              url: uploadFile.url,
            });
            return await queryRunner.manager.save(fileMessage);
          }),
        );

        fileUploads = uploads;
      }

      const updatedMessage = await queryRunner.manager.preload(Message, {
        id: message.id,
        content: updateMessageDto.content,
        files: fileUploads,
        isEdited: true,
      });

      await queryRunner.manager.save(updatedMessage);
      await queryRunner.commitTransaction();

      await this.notificationGateway.notifyMessageEdited(
        message.receiver.id,
        userId,
        chat.id,
        message.id,
      );

      return updatedMessage;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMessage(userId: string, chatId: string, messageId: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, is_active: true },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    const message = await this.messageRepository.findOne({
      where: { id: messageId, is_active: true },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException(`Message with id ${messageId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (message.sender.id !== user.id) {
      throw new UnauthorizedException(
        `You don't have permission to delete this message`,
      );
    }

    const deletedFiles = await this.fileMessageRepository.find({
      where: { message: { id: message.id } },
    });

    if (deletedFiles.length > 0) {
      await Promise.all(
        deletedFiles.map(async (file) => {
          const fileToUpdate = await this.fileMessageRepository.preload({
            id: file.id,
            is_active: false,
          });

          if (fileToUpdate) {
            await this.fileMessageRepository.save(fileToUpdate);
          }
        }),
      );
    }

    const eliminatedMessage = await this.messageRepository.preload({
      id: message.id,
      is_active: false,
    });

    await this.messageRepository.save(eliminatedMessage);

     await this.notificationGateway.notifyMessageDeleted(
       message.receiver.id,
       user.id,
       chat.id,
       message.id,
     );

    return { message: 'Message deleted' };
  }

  async deleteChat(userId: string, chatId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const chat = await this.chatRepository.findOne({
      where: { id: chatId, is_active: true },
      relations: ['sender'],
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    if (chat.sender.id !== user.id) {
      throw new UnauthorizedException(
        `You don't have permission to delete this chat`,
      );
    }

    const eliminatedChat = await this.chatRepository.preload({
      id: chat.id,
      is_active: false,
    });

    await this.chatRepository.save(eliminatedChat);
    return { message: 'Chat deleted' };
  }

  async getMessagesByChat(
    userId: string,
    chatId: string,
    paginationDto: PaginationDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      select: ['id', 'hiddenChats'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (user.hiddenChats.includes(chatId)) {
      throw new UnauthorizedException(
        'This chat is hidden and cannot be accessed',
      );
    }

    const chat = await this.chatRepository.findOne({
      where: {
        id: chatId,
        is_active: true,
        sender: { is_active: true },
        receiver: { is_active: true },
      },
      relations: [
        'sender',
        'receiver',
        'sender.file',
        'receiver.file',
        'messages',
        'messages.sender',
      ],
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    if (chat.sender.id !== user.id && chat.receiver.id !== user.id) {
      throw new UnauthorizedException(
        `You don't have permission to access this chat`,
      );
    }

    if (chat.sender.id !== user.id && chat.receiver.id !== user.id) {
      throw new UnauthorizedException(
        `You don't have permission to access this chat`,
      );
    }

    const { messages, meta } =
      await this.paginationChatService.paginateMessages(chatId, paginationDto);

    const chatPartner =
      chat.sender.id === user.id ? chat.receiver : chat.sender;

    const formattedMessages = messages.map((message) => ({
      id: message.id,
      created_at: message.created_at,
      updated_at: message.updated_at,
      content: message.content,
      isRead: message.isRead,
      isEdited: message.isEdited,
      is_active: message.is_active,
      sentAt: message.sentAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        lastname: message.sender.lastname,
        file: message.sender.file,
      },
    }));

    return {
      chatPartner: {
        id: chatPartner.id,
        name: chatPartner.name,
        lastname: chatPartner.lastname,
        file: chatPartner.file,
      },
      messages: formattedMessages,
      meta,
    };
  }

  async getAllChats(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      select: ['id', 'hiddenChats'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const chats = await this.chatRepository.find({
      where: [
        { sender: { id: userId, is_active: true } },
        { receiver: { id: userId, is_active: true } },
      ],
      relations: [
        'sender',
        'receiver',
        'sender.file',
        'receiver.file',
        'messages',
      ],
      order: { updated_at: 'DESC' },
    });

    if (!chats || chats.length === 0) {
      return [];
    }

    const visibleChats = chats.filter(
      (chat) => !user.hiddenChats.includes(chat.id),
    );

    const chatsWithLastMessage = visibleChats.map((chat) => {
      const lastMessage =
        chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].content
          : null;
      return {
        chatId: chat.id,
        participants: {
          sender: {
            id: chat.sender.id,
            name: chat.sender.name,
            lastname: chat.sender.lastname,
            file: chat.sender.file,
          },
          receiver: {
            id: chat.receiver.id,
            name: chat.receiver.name,
            lastname: chat.receiver.lastname,
            file: chat.receiver.file,
          },
        },
        lastMessage,
        updatedAt: chat.updated_at,
      };
    });

    return chatsWithLastMessage;
  }

  async hideMessageChat(
    userId: string,
    chatId: string,
    passwordHidden: string,
  ) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!passwordHidden) {
      throw new BadRequestException('Password is required');
    }

    if (!userAuth.passwordHidden) {
      const hashedPassword = await bcrypt.hash(passwordHidden, 10);
      userAuth.passwordHidden = hashedPassword;

      await this.userRepository.save(userAuth);

      return {
        message:
          'Password for hiding chats set successfully. You can now hide chats.',
      };
    }

    const isValidPassword = await bcrypt.compare(
      passwordHidden,
      userAuth.passwordHidden,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const chat = await this.chatRepository.findOne({
      where: {
        id: chatId,
        is_active: true,
        sender: { is_active: true },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    if (!userAuth.hiddenChats.includes(chat.id)) {
      userAuth.hiddenChats.push(chat.id);
      chat.expiredAt = new Date(Date.now() + 30 * 1000);

      await this.chatRepository.save(chat);
      await this.userRepository.save(userAuth);
    }

    return { message: 'Chat hidden' };
  }

  async getHiddenChatsMessages(
    userId: string,
    passwordHidden: string,
  ): Promise<any[]> {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      select: ['id', 'hiddenChats', 'passwordHidden'],
    });

    if (!userAuth) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!passwordHidden) {
      throw new BadRequestException('Password is required');
    }

    if (!userAuth.passwordHidden) {
      throw new ForbiddenException('No password set for hidden chats');
    }

    const isPasswordValid = await bcrypt.compare(
      passwordHidden,
      userAuth.passwordHidden,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Incorrect password for hidden chats');
    }

    if (!userAuth.hiddenChats || userAuth.hiddenChats.length === 0) {
      return [];
    }

    const hiddenChats = await this.chatRepository.find({
      where: {
        id: In(userAuth.hiddenChats),
        is_active: true,
        sender: { is_active: true },
        receiver: { is_active: true },
      },
      relations: ['sender', 'receiver', 'messages'],
    });

    if (hiddenChats.length === 0) {
      throw new NotFoundException('No hidden chats found');
    }

    const hiddenMessages = hiddenChats.map((chat) => {
      const lastMessage =
        chat.messages && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null;

      return {
        chatId: chat.id,
        participants: {
          sender: {
            id: chat.sender.id,
            name: `${chat.sender.name} ${chat.sender.lastname}`,
            fileUrl: chat.sender.file?.url || null,
          },
          receiver: {
            id: chat.receiver.id,
            name: `${chat.receiver.name} ${chat.receiver.lastname}`,
            fileUrl: chat.receiver.file?.url || null,
          },
        },
        messages: chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          createdAt: message.created_at,
        })),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.created_at,
            }
          : null,
      };
    });

    return hiddenMessages;
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const userReceptorMessage = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userReceptorMessage) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const message = await this.messageRepository.findOne({
      where: { id: messageId, is_active: true },
      relations: ['receiver'],
    });

    if (!message) {
      throw new NotFoundException(`Message with id ${messageId} not found`);
    }

    if (message.receiver.id !== userReceptorMessage.id) {
      throw new UnauthorizedException(
        `You don't have permission to mark this message as read`,
      );
    }

    const messageIsRead = await this.messageRepository.preload({
      id: message.id,
      isRead: true,
    });

    return await this.messageRepository.save(messageIsRead);
  }

  async likeMessage(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, is_active: true },
      relations: ['likes'],
    });

    if (!message) {
      throw new NotFoundException(`Message with id ${messageId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    const existingLike = message.likes.find((like) => like.user.id === userId);
    if (existingLike) {
      throw new UnauthorizedException(`You already liked this message`);
    }

    const like = this.likeRepository.create({ user, message });
    await this.likeRepository.save(like);

     await this.notificationGateway.notifyMessageLiked(
       message.sender.id,
       user.id,
       message.id,
     );

    return message;
  }

  async unlikeMessage(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, is_active: true },
      relations: ['likes'],
    });

    if (!message) {
      throw new NotFoundException(`Message with id ${messageId} not found`);
    }

    const like = await this.likeRepository.findOne({
      where: { user: { id: userId }, message: { id: messageId } },
    });

    if (!like) {
      throw new UnauthorizedException(`You haven't liked this message yet`);
    }

    await this.likeRepository.remove(like);
    return message;
  }

  async searchChats(userId: string, searchTerm: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const chats = await this.chatRepository.find({
      where: [
        {
          sender: { id: userId },
          receiver: {
            name: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:term)`, {
              term: `%${searchTerm}%`,
            }),
          },
        },
        {
          receiver: { id: userId },
          sender: {
            name: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:term)`, {
              term: `%${searchTerm}%`,
            }),
          },
        },
      ],
      relations: ['messages.sender', 'sender', 'receiver', 'messages'],
    });

    return chats.map((chat) => {
      const lastMessage =
        chat.messages && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null;

      const isSender = chat.sender.id === userId;
      const otherUser = isSender ? chat.receiver : chat.sender;

      return {
        id: chat.id,
        lastMessage,
        userPhoto: otherUser.file?.url || null,
        userName: `${otherUser.name} ${otherUser.lastname}`,
      };
    });
  }
  async searchMessagesInChat(
    userId: string,
    chatId: string,
    searchTerm: string,
  ) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, is_active: true },
      relations: ['messages', 'messages.sender', 'sender', 'receiver'],
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    if (chat.sender.id !== userId && chat.receiver.id !== userId) {
      throw new ForbiddenException('User is not a member of this chat');
    }

    const messages = chat.messages
      .filter((message) => message.content.includes(searchTerm))
      .filter((message) => message.content.includes(searchTerm))
      .map((message) => {
        const senderPhoto = message.sender ? message.sender.file?.url : null;
        const senderName = message.sender
          ? `${message.sender.name} ${message.sender.lastname}`
          : 'Unknown Sender';

        return {
          content: message.content,
          userPhoto: senderPhoto,
          userName: senderName,
        };
      });

    return messages;
  }
}
