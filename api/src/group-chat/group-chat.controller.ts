import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { GroupChatService } from './group-chat.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateSendMessageDto } from './dto/create-send-message.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Auth(Roles.USER)
@Controller('group-chat')
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @Post('createGroup')
  async createGroup(
    @Body() createGroupChatDto: CreateGroupChatDto,
    @GetUser('id') userId: string,
    @Body('membersId') membersId: string[],
  ) {
    return this.groupChatService.createGroup(
      userId,
      createGroupChatDto,
      membersId,
    );
  }

  @Post('addMembers/:groupId')
  async addMembers(
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
    @Body('membersId') membersId: string[],
  ) {
    return this.groupChatService.addMembers(groupId, userId, membersId);
  }

  @Post('sendMessage/:groupId/message')
  @UseInterceptors(FilesInterceptor('files', 10, {}))
  async sendMessageGroup(
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
    @Body() createMessageDto: CreateSendMessageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.groupChatService.sendMessageGroup(
      groupId,
      userId,
      createMessageDto,
      files,
    );
  }

  @Post('showHiddenGroups')
  async showHiddenGroup(
    @GetUser('id') userId: string,
    @Body('passwordHidden') passwordHidden: string,
  ) {
    return this.groupChatService.showHiddenGroups(userId, passwordHidden);
  }

  @Post('hideGroup/:groupId')
  async hideGroup(
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
    @Body('passwordHidden') passwordHidden: string,
  ) {
    return this.groupChatService.hideGroupChat(groupId, userId, passwordHidden);
  }

  @Patch('editGroup/:groupId')
  async editGroup(
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
    @Body() updateGroupChatDto: UpdateGroupChatDto,
  ) {
    return this.groupChatService.editGroup(groupId, userId, updateGroupChatDto);
  }

  @UseInterceptors(FilesInterceptor('files', 10, {}))
  @Patch('updateMessage/:groupId/message/:messageId')
  async updateMessageGroup(
    @Param('messageId') messageId: string,
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.groupChatService.editMessage(
      messageId,
      groupId,
      userId,
      updateMessageDto,
      files,
    );
  }

  @Get('AllMessagesGroup/:groupId/message')
  async getAllMessagesGroup(
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.groupChatService.getAllMessagesGroup(
      groupId,
      userId,
      paginationDto,
    );
  }

  @Get('userGroups')
  async getUserGroups(@GetUser('id') userId: string) {
    return this.groupChatService.getUserGroups(userId);
  }

  @Get('searchGroups')
  async searchGroups(
    @GetUser('id') userId: string,
    @Query('searchTerm') searchTerm: string,
  ) {
    return this.groupChatService.searchGroups(userId, searchTerm);
  }

  @Get(':groupId/messages/search')
  async searchMessagesInGroup(
    @GetUser('userId') userId: string,
    @Param('groupId') groupId: string,
    @Query('searchTerm') searchTerm: string,
  ) {
    return this.groupChatService.searchMessagesInGroup(
      groupId,
      userId,
      searchTerm,
    );
  }

  @Delete('deleteGroup/:groupId')
  async deleteGroup(
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
  ) {
    return this.groupChatService.deleteGroup(groupId, userId);
  }

  @Delete('deleteMessage/:groupId/message/:messageId')
  async deleteMessageGroup(
    @Param('messageId') messageId: string,
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
  ) {
    return this.groupChatService.deleteMessage(messageId, groupId, userId);
  }

  @Delete('leaveGroup/:groupId')
  async leaveGroup(
    @Param('groupId') groupId: string,
    @GetUser('id') userId: string,
  ) {
    return this.groupChatService.leaveGroup(groupId, userId);
  }

  @Delete('deleteMembers/:groupId')
  async DeleteMembers(
    @Param('groupId') groupId: string,
    @Body('membersId') membersId: string[],
    @GetUser('id') userId: string,
  ) {
    return this.groupChatService.deleteMembers(groupId, membersId, userId);
  }
}
