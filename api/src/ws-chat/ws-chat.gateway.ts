import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, type Socket } from 'socket.io';
import { ChatWsController } from 'src/chat/chat-socket.controller';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateGroupChatDto } from 'src/group-chat/dto/create-group-chat.dto';
import { UpdateGroupChatDto } from 'src/group-chat/dto/update-group-chat.dto';
import { GroupChatWsController } from 'src/group-chat/group-chat-socket.controller';
import {
  CreateChatPayload,
  DeleteMessagePayload,
  EditMessagePayload,
  GetMessagesByChatPayload,
  LikeMessagePayload,
  MarkAsReadPayload,
  SendMessagePayload,
} from 'src/types/type.chat-webhook';

@WebSocketGateway(8080, {
  cors: true,
  origin: '*',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private onlineUsers: Map<string, Socket> = new Map();
  private rooms: Record<string, string[]> = {};

  constructor(
    private readonly chatWsController: ChatWsController,
    private readonly groupChatWsController: GroupChatWsController,
  ) {}


  afterInit(server: Server) {
    console.log('Chat gateway initialized');
  }

  handleConnection(client: Socket) {
    this.onlineUsers.set(client.id, client);
    this.server.emit('userStatusUpdate', {
      userId: client.id,
      online: true,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected:', client.id);
    this.onlineUsers.forEach((socket, userId) => {
      if (socket.id === client.id) {
        this.onlineUsers.delete(userId);
      }
    });

    
    Object.keys(this.rooms).forEach((roomID) => {
      this.rooms[roomID] = this.rooms[roomID].filter((id) => id !== client.id);
      if (this.rooms[roomID].length === 0) {
        delete this.rooms[roomID]; 
      }
    });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  @SubscribeMessage('checkUserStatus')
  handleCheckUserStatus(client: Socket, userId: string) {
    const online = this.isUserOnline(userId);
    client.emit('userStatus', { userId, online });
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, chatId: string) {
    client.join(chatId);
    console.log(`Client ${client.id} joined chat ${chatId}`);
  }

  @SubscribeMessage('createChat')
  handleCreateChat(client: Socket, payload: CreateChatPayload) {
    this.chatWsController.handleCreateChat(client, payload, this.server);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(client: Socket, payload: SendMessagePayload) {
    this.chatWsController.handleSendMessage(client, payload, this.server);
  }

  @SubscribeMessage('editMessage')
  handleEditMessage(client: Socket, payload: EditMessagePayload) {
    this.chatWsController.handleEditMessage(client, payload, this.server);
  }

  @SubscribeMessage('deleteMessage')
  handleDeleteMessage(client: Socket, payload: DeleteMessagePayload) {
    this.chatWsController.handleDeleteMessage(client, payload, this.server);
  }

  @SubscribeMessage('getMessagesByChat')
  handleGetMessagesByChat(client: Socket, payload: GetMessagesByChatPayload) {
    this.chatWsController.handleGetMessagesByChat(client, payload, this.server);
  }

  @SubscribeMessage('markAsRead')
  handleMarkAsRead(client: Socket, payload: MarkAsReadPayload) {
    this.chatWsController.handleMarkAsRead(client, payload, this.server);
  }

  @SubscribeMessage('likeMessage')
  handleLikeMessage(client: Socket, payload: LikeMessagePayload) {
    this.chatWsController.handleLikeMessage(client, payload, this.server);
  }

  @SubscribeMessage('unlikeMessage')
  handleUnlikeMessage(client: Socket, payload: LikeMessagePayload) {
    this.chatWsController.handleUnlikeMessage(client, payload, this.server);
  }

  @SubscribeMessage('groupCreateGroup')
  handleGroupCreateGroup(
    client: Socket,
    payload: {
      createGroupChatDto: CreateGroupChatDto;
      userId: string;
      membersIds: string[];
    },
  ) {
    this.groupChatWsController.handleCreateGroup(client, payload, this.server);
  }

  @SubscribeMessage('groupEditGroup')
  handleGroupEditGroup(
    client: Socket,
    payload: {
      groupId: string;
      userId: string;
      updateGroupChatDto: UpdateGroupChatDto;
    },
  ) {
    this.groupChatWsController.handleEditGroup(client, payload, this.server);
  }

  @SubscribeMessage('groupAddMembers')
  handleGroupAddMembers(
    client: Socket,
    payload: {
      groupId: string;
      userId: string;
      membersIds: string[];
    },
  ) {
    this.groupChatWsController.handleAddMembers(client, payload, this.server);
  }

  @SubscribeMessage('groupRemoveUserFromGroup')
  handleGroupRemoveUserFromGroup(
    client: Socket,
    payload: {
      groupId: string;
      userId: string;
      membersIds: string[];
    },
  ) {
    this.groupChatWsController.handleRemoveUserFromGroup(
      client,
      payload,
      this.server,
    );
  }

  @SubscribeMessage('groupLeaveGroup')
  handleGroupLeaveGroup(
    client: Socket,
    payload: { groupId: string; userId: string },
  ) {
    this.groupChatWsController.handleLeaveGroup(client, payload, this.server);
  }

  @SubscribeMessage('groupSendMessage')
  handleGroupSendMessage(
    client: Socket,
    payload: {
      groupId: string;
      userId: string;
      content: string;
      files: Express.Multer.File[];
    },
  ) {
    this.groupChatWsController.handleSendMessage(client, payload, this.server);
  }

  @SubscribeMessage('groupEditMessage')
  handleGroupEditMessage(
    client: Socket,
    payload: {
      messageId: string;
      groupId: string;
      userId: string;
      files: Express.Multer.File[];
      updateGroupChatDto: UpdateGroupChatDto;
    },
  ) {
    this.groupChatWsController.handleEditMessage(client, payload, this.server);
  }

  @SubscribeMessage('groupDeleteMessage')
  handleGroupDeleteMessage(
    client: Socket,
    payload: { messageId: string; groupId: string; userId: string },
  ) {
    this.groupChatWsController.handleDeleteMessage(
      client,
      payload,
      this.server,
    );
  }

  @SubscribeMessage('groupGetGroupMessages')
  handleGroupGetGroupMessages(
    client: Socket,
    payload: { groupId: string; userId: string; paginationDto: PaginationDto },
  ) {
    this.groupChatWsController.handleGetGroupMessages(
      client,
      payload,
      this.server,
    );
  }

  @SubscribeMessage('groupDeleteGroup')
  handleGroupDeleteGroup(
    client: Socket,
    payload: { groupId: string; userId: string },
  ) {
    this.groupChatWsController.handleDeleteGroup(client, payload, this.server);
  }

  @SubscribeMessage('groupGetUserGroups')
  handleGroupGetUserGroups(client: Socket, payload: { userId: string }) {
    this.groupChatWsController.handleGetUserGroups(
      client,
      payload,
      this.server,
    );
  }

  @SubscribeMessage('JOIN_ROOM')
  handleJoinRoom(client: Socket, roomID: string) {
    if (this.rooms[roomID]) {
      this.rooms[roomID].push(client.id);
    } else {
      this.rooms[roomID] = [client.id];
    }

    const otherUser = this.rooms[roomID].find((id) => id !== client.id);
    if (otherUser) {
      client.emit('OTHER_USER', otherUser);
      this.server.to(otherUser).emit('USER_JOINED', client.id);
    }
  }

  @SubscribeMessage('OFFER')
  handleOffer(
    client: Socket,
    payload: { target: string; offer: RTCSessionDescriptionInit },
  ) {
    this.server.to(payload.target).emit('OFFER', {
      from: client.id,
      offer: payload.offer,
    });
  }

  @SubscribeMessage('ANSWER')
  handleAnswer(
    client: Socket,
    payload: { target: string; answer: RTCSessionDescriptionInit },
  ) {
    this.server.to(payload.target).emit('ANSWER', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('ICE_CANDIDATE')
  handleIceCandidate(
    client: Socket,
    payload: { target: string; candidate: RTCIceCandidateInit },
  ) {
    this.server.to(payload.target).emit('ICE_CANDIDATE', {
      from: client.id,
      candidate: payload.candidate,
    });
  }
}
