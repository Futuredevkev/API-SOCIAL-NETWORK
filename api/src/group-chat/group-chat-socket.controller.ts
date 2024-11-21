import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { GroupChatService } from './group-chat.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { CreateSendMessageDto } from './dto/create-send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class GroupChatWsController {
  constructor(private readonly groupChatService: GroupChatService) {}

  async handleCreateGroup(
    client: Socket,
    payload: {
      createGroupChatDto: CreateGroupChatDto;
      userId: string;
      membersIds: string[];
    },
    server: Server,
  ) {
    try {
      const newGroup = await this.groupChatService.createGroup(
        payload.userId,
        payload.createGroupChatDto,
        payload.membersIds,
      );
      server.emit('groupCreated', newGroup);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleEditGroup(
    client: Socket,
    payload: {
      groupId: string;
      userId: string;
      updateGroupChatDto: UpdateGroupChatDto;
    },
    server: Server,
  ) {
    try {
      const editedMessage = await this.groupChatService.editGroup(
        payload.groupId,
        payload.userId,
        payload.updateGroupChatDto,
      );
      server.emit('messageEdited', editedMessage); // Notifica a los clientes que el mensaje fue editado
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleAddMembers(
    client: Socket,
    payload: { groupId: string; userId: string; membersIds: string[] },
    server: Server,
  ) {
    try {
      const updatedGroup = await this.groupChatService.addMembers(
        payload.groupId,
        payload.userId,
        payload.membersIds,
      );
      server.emit('userAddedToGroup', updatedGroup);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleRemoveUserFromGroup(
    client: Socket,
    payload: { groupId: string; membersIds: string[]; userId: string },
    server: Server,
  ) {
    try {
      const updatedGroup = await this.groupChatService.deleteMembers(
        payload.groupId,
        payload.membersIds,
        payload.userId,
      );
      server.emit('userRemovedFromGroup', updatedGroup);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleLeaveGroup(
    client: Socket,
    payload: { groupId: string; userId: string },
    server: Server,
  ) {
    try {
      const updatedGroup = await this.groupChatService.leaveGroup(
        payload.groupId,
        payload.userId,
      );
      client.leave(payload.groupId);
      server.emit('userLeftGroup', updatedGroup);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleSendMessage(
    client: Socket,
    payload: {
      groupId: string;
      userId: string;
      content: string;
      files: Express.Multer.File[];
    },
    server: Server,
  ) {
    try {
      const sendMessageDto: CreateSendMessageDto = {
        content: payload.content,
      };

      const newMessage = await this.groupChatService.sendMessageGroup(
        payload.groupId,
        payload.userId,
        sendMessageDto,
        payload.files,
      );
      server.emit('messageSent', newMessage);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleEditMessage(
    client: Socket,
    payload: {
      messageId: string;
      groupId: string;
      userId: string;
      files: Express.Multer.File[];
    },
    server: Server,
  ) {
    try {
      const updateMessageDto: UpdateMessageDto = {
        ids_images: [],
      };

      const editedMessage = await this.groupChatService.editMessage(
        payload.messageId,
        payload.groupId,
        payload.userId,
        updateMessageDto,
        payload.files,
      );
      server.emit('messageEdited', editedMessage);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
  async handleDeleteMessage(
    client: Socket,
    payload: { messageId: string; groupId: string; userId: string },
    server: Server,
  ) {
    try {
      await this.groupChatService.deleteMessage(
        payload.messageId,
        payload.userId,
        payload.groupId,
      );
      server.emit('messageDeleted', { messageId: payload.messageId });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleGetGroupMessages(
    client: Socket,
    payload: { groupId: string; userId: string; paginationDto: PaginationDto },
    server: Server,
  ) {
    try {
      const messages = await this.groupChatService.getAllMessagesGroup(
        payload.groupId,
        payload.userId,
        payload.paginationDto,
      );
      client.emit('groupMessages', messages);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleDeleteGroup(
    client: Socket,
    payload: { groupId: string; userId: string },
    server: Server,
  ) {
    try {
      await this.groupChatService.deleteGroup(payload.groupId, payload.userId);
      server.emit('groupDeleted', { groupId: payload.groupId });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  async handleGetUserGroups(
    client: Socket,
    payload: { userId: string },
    server: Server,
  ) {
    try {
      const groups = await this.groupChatService.getUserGroups(payload.userId);
      client.emit('userGroups', groups);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
