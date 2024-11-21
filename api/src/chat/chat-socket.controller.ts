import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ChatWsController {
  constructor(private readonly chatService: ChatService) {}
  async handleCreateChat(
    client: Socket,
    payload: { userId: string; receiverId: string },
    server: Server,
  ) {
    try {
      const chat = await this.chatService.createChat(
        payload.userId,
        payload.receiverId,
      );
      server.emit('chatCreated', chat);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleSendMessage(
    client: Socket,
    payload: {
      chatId: string;
      userId: string;
      createChatDto: CreateChatDto;
      files: Express.Multer.File[];
    },
    server: Server,
  ) {
    try {
      const message = await this.chatService.sendMessage(
        payload.chatId,
        payload.userId,
        payload.createChatDto,
        payload.files,
      );
      server.emit('messageReceived', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleEditMessage(
    client: Socket,
    payload: {
      messageId: string;
      newContent: string;
      userId: string;
      chatId: string;
      files: Express.Multer.File[];
    },
    server: Server,
  ) {
    try {
      const updateMessageDto: UpdateMessageDto = {
        content: payload.newContent,
      };
      const message = await this.chatService.editMessage(
        payload.userId,
        payload.chatId,
        payload.messageId,
        updateMessageDto,
        payload.files,
      );
      server.emit('messageEdited', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleDeleteMessage(
    client: Socket,
    payload: { messageId: string; userId: string; chatId: string },
    server: Server,
  ) {
    try {
      await this.chatService.deleteMessage(
        payload.userId,
        payload.chatId,
        payload.messageId,
      );
      server.emit('messageDeleted', payload.messageId);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleDeleteChat(
    client: Socket,
    payload: { userId: string; chatId: string },
    server: Server,
  ) {
    try {
      await this.chatService.deleteChat(payload.userId, payload.chatId);
      server.emit('chatDeleted', payload.chatId);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleGetMessagesByChat(
    client: Socket,
    payload: { userId: string; chatId: string; paginationDto: PaginationDto },
    server: Server,
  ) {
    try {
      const messages = await this.chatService.getMessagesByChat(
        payload.userId,
        payload.chatId,
        payload.paginationDto,
      );
      server.emit('messagesReceived', messages);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleMarkAsRead(
    client: Socket,
    payload: { messageId: string; userId: string },
    server: Server,
  ) {
    try {
      const message = await this.chatService.markAsRead(payload.messageId);
      server.emit('messageRead', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleLikeMessage(
    client: Socket,
    payload: { userId: string; messageId: string },
    server: Server,
  ) {
    try {
      const message = await this.chatService.likeMessage(
        payload.userId,
        payload.messageId,
      );
      server.emit('messageLiked', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleUnlikeMessage(
    client: Socket,
    payload: { userId: string; messageId: string },
    server: Server,
  ) {
    try {
      const message = await this.chatService.unlikeMessage(
        payload.userId,
        payload.messageId,
      );
      server.emit('messageUnliked', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
