import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Get,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('chat')
@Auth(Roles.USER, Roles.ADMIN)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post('create/:receiverId')
  async createChat(
    @GetUser('id') userId: string,
    @Param('receiverId') receiverId: string,
  ) {
    return this.chatService.createChat(userId, receiverId);
  }

  @Post('send/:chatId')
  @UseInterceptors(FilesInterceptor('files', 10, {}))
  async sendMessage(
    @GetUser('id') userId: string,
    @Body() createChatDto: CreateChatDto,
    @Param('chatId') chatId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.chatService.sendMessage(userId, chatId, createChatDto, files);
  }

  @Post('like/:messageId')
  async likeMessage(
    @GetUser('id') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.chatService.likeMessage(userId, messageId);
  }

  @Post('unlike/:messageId')
  async unlikeMessage(
    @GetUser('id') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.chatService.unlikeMessage(userId, messageId);
  }

  @Post('hide/:chatId')
  async hideMessageChat(
    @GetUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Body('passwordHidden') passwordHidden: string,
  ) {
    return this.chatService.hideMessageChat(userId, chatId, passwordHidden);
  }

  @Get('getMessages/:chatId')
  async getMessagesByChat(
    @GetUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.chatService.getMessagesByChat(userId, chatId, paginationDto);
  }

  @Get('search-chats')
  async searchChats(
    @GetUser('id') userId: string,
    @Query('searchTerm') searchTerm: string,
  ) {
    return this.chatService.searchChats(userId, searchTerm);
  }

  @Get('search-chats-messages/:chatId')
  async searchMessages(
    @GetUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Query('searchTerm') searchTerm: string,
  ) {
    return this.chatService.searchMessagesInChat(userId, chatId, searchTerm);
  }

  @Get('getAllChats')
  async getAllChats(@GetUser('id') userId: string) {
    return this.chatService.getAllChats(userId);
  }

  @Get('hiddenChats')
  async getHiddenChats(
    @GetUser('id') userId: string,
    @Body('passwordHidden') passwordHidden: string,
  ) {
    return this.chatService.getHiddenChatsMessages(userId, passwordHidden);
  }

  @Patch('edit/:chatId/:messageId')
  @UseInterceptors(FilesInterceptor('files', 10, {}))
  async editMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @GetUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.chatService.editMessage(
      userId,
      chatId,
      messageId,
      updateMessageDto,
      files,
    );
  }

  @Patch('read/:messageId')
  async markAsRead(@Param('messageId') messageId: string) {
    return this.chatService.markAsRead(messageId);
  }

  @Delete('deleteMessage/:chatId/:messageId')
  async deleteMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @GetUser('id') userId: string,
  ) {
    return this.chatService.deleteMessage(chatId, messageId, userId);
  }

  @Delete('deleteChat/:chatId')
  async deleteChat(
    @GetUser('id') userId: string,
    @Param('chatId') chatId: string,
  ) {
    return this.chatService.deleteChat(userId, chatId);
  }
}
