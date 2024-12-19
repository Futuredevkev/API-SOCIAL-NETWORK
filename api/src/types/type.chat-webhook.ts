import { CreateChatDto } from 'src/chat/dto/create-chat.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export interface CreateChatPayload {
  userId: string;
  receiverId: string;
}

export interface SendMessagePayload {
  chatId: string;
  userId: string;
  createChatDto: CreateChatDto;
  files: Express.Multer.File[];
  receiverId?: string;
}

export interface EditMessagePayload {
  messageId: string;
  newContent: string;
  userId: string;
  chatId: string;
  files: Express.Multer.File[];
}

export interface DeleteMessagePayload {
  messageId: string;
  userId: string;
  chatId: string;
}

export interface GetMessagesByChatPayload {
  userId: string;
  chatId: string;
  paginationDto: PaginationDto;
}

export interface MarkAsReadPayload {
  messageId: string;
  userId: string;
}

export interface LikeMessagePayload {
  userId: string;
  messageId: string;
}
