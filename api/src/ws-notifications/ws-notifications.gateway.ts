import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationType } from 'src/enums/enum-notifications-type';
import { NotificationService } from 'src/notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  private userSocketMap: Map<string, string> = new Map();

  constructor(private readonly notificationService: NotificationService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('register')
  handleRegistration(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.userSocketMap.set(userId, client.id);
    client.join(userId);
  }

  async sendNotification(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
    relatedEntityId: string,
  ) {
    const notification = await this.notificationService.createNotification(
      recipientId,
      senderId,
      type,
      message,
      relatedEntityId,
    );

    const socketId = this.userSocketMap.get(recipientId);
    if (socketId) {
      this.server.to(recipientId).emit('newNotification', notification);
    }
  }

  async notifyCommentOnPublication(
    publicationAuthorId: string,
    commenterId: string,
    publicationId: string,
  ) {
    await this.sendNotification(
      publicationAuthorId,
      commenterId,
      NotificationType.COMMENT_ON_PUBLICATION,
      'A new comment has been added to your publication',
      publicationId,
    );
  }

  async notifyResponseToComment(
    commentAuthorId: string,
    responderId: string,
    commentId: string,
  ) {
    await this.sendNotification(
      commentAuthorId,
      responderId,
      NotificationType.RESPONSE_TO_COMMENT,
      'Someone responded to your comment',
      commentId,
    );
  }

  async notifyResponseToResponse(
    originalResponseAuthorId: string,
    responderId: string,
    responseId: string,
  ) {
    await this.sendNotification(
      originalResponseAuthorId,
      responderId,
      NotificationType.RESPONSE_TO_RESPONSE,
      'Someone responded to your response',
      responseId,
    );
  }

  async notifyLikeUser(
    publicationAuthorId: string,
    likeUserId: string,
    publicationId: string,
  ) {
    await this.sendNotification(
      publicationAuthorId,
      likeUserId,
      NotificationType.LIKE_PUBLICATION,
      'Your publication has been liked',
      publicationId,
    );
  }

  async notifyNewMessage(
    recipientId: string,
    senderId: string,
    chatId: string,
    messagePreview: string,
  ) {
    const message = `New message from ${senderId}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`;

    await this.sendNotification(
      recipientId,
      senderId,
      NotificationType.NEW_MESSAGE,
      message,
      chatId,
    );
  }

  async notifyMessageEdited(
    recipientId: string,
    senderId: string,
    chatId: string,
    messageId: string,
  ) {
    await this.sendNotification(
      recipientId,
      senderId,
      NotificationType.MESSAGE_EDITED,
      'A message has been edited',
      messageId,
    );
  }

  async notifyMessageDeleted(
    recipientId: string,
    senderId: string,
    chatId: string,
    messageId: string,
  ) {
    await this.sendNotification(
      recipientId,
      senderId,
      NotificationType.MESSAGE_DELETED,
      'A message has been deleted',
      messageId,
    );
  }

  async notifyMessageLiked(
    recipientId: string,
    likerId: string,
    messageId: string,
  ) {
    await this.sendNotification(
      recipientId,
      likerId,
      NotificationType.MESSAGE_LIKED,
      'Someone liked your message',
      messageId,
    );
  }

  async notifyGroupCreated(
    adminId: string,
    groupUsers: string[],
    groupName: string,
    groupId: string,
  ) {
    for (const userId of groupUsers) {
      if (userId !== adminId) {
        await this.sendNotification(
          userId,
          adminId,
          NotificationType.GROUP_CREATED,
          `You have been added to the new group "${groupName}"`,
          groupId,
        );
      }
    }
  }

  async notifyNewGroupMessage(
    groupId: string,
    senderId: string,
    messagePreview: string,
    groupUsers: string[],
  ) {
    const message = `New group message from ${senderId}: ${messagePreview.substring(0, 50)}${
      messagePreview.length > 50 ? '...' : ''
    }`;

    for (const userId of groupUsers) {
      if (userId !== senderId) {
        await this.sendNotification(
          userId,
          senderId,
          NotificationType.GROUP_MESSAGE,
          message,
          groupId,
        );
      }
    }
  }

  async notifyGroupMemberAdded(
    groupId: string,
    adminId: string,
    newMemberId: string,
    groupName: string,
  ) {
    await this.sendNotification(
      newMemberId,
      adminId,
      NotificationType.GROUP_MEMBER_ADDED,
      `You have been added to the group "${groupName}"`,
      groupId,
    );
  }

  async notifyGroupMemberRemoved(
    groupId: string,
    adminId: string,
    removedMemberId: string,
    groupName: string,
    remainingMembers: string[] = [],
  ) {
    const message =
      adminId === removedMemberId
        ? `${removedMemberId} has left the group "${groupName}"`
        : `${removedMemberId} has been removed from the group "${groupName}"`;

    for (const userId of remainingMembers) {
      await this.sendNotification(
        userId,
        adminId,
        NotificationType.GROUP_MEMBER_REMOVED,
        message,
        groupId,
      );
    }
  }

  async notifyYourselfGroupMemberRemoved(
    groupId: string,
    yourselfUserId: string,
    groupName: string,
  ) {
    await this.sendNotification(
      yourselfUserId,
      yourselfUserId,
      NotificationType.YOURSELF_GROUP_MEMBER_REMOVED,
      `You have left the group "${groupName}"`,
      groupId,
    );
  }

  async notifyGroupEdited(
    groupId: string,
    editorId: string,
    groupUsers: string[],
    groupName: string,
  ) {
    for (const userId of groupUsers) {
      if (userId !== editorId) {
        await this.sendNotification(
          userId,
          editorId,
          NotificationType.GROUP_EDITED,
          `The group "${groupName}" has been updated`,
          groupId,
        );
      }
    }
  }

  async notifyGroupDeleted(
    groupId: string,
    adminId: string,
    groupUsers: string[],
    groupName: string,
  ) {
    for (const userId of groupUsers) {
      if (userId !== adminId) {
        await this.sendNotification(
          userId,
          adminId,
          NotificationType.GROUP_DELETED,
          `The group "${groupName}" has been deleted`,
          groupId,
        );
      }
    }
  }

  async notifyGroupMessageEdited(
    groupId: string,
    editorId: string,
    groupUsers: string[],
    messageId: string,
  ) {
    for (const userId of groupUsers) {
      if (userId !== editorId) {
        await this.sendNotification(
          userId,
          editorId,
          NotificationType.GROUP_MESSAGE_EDITED,
          'A message has been edited in the group',
          messageId,
        );
      }
    }
  }

  async notifyGroupMessageDeleted(
    groupId: string,
    deleterId: string,
    groupUsers: string[],
    messageId: string,
  ) {
    for (const userId of groupUsers) {
      if (userId !== deleterId) {
        await this.sendNotification(
          userId,
          deleterId,
          NotificationType.GROUP_MESSAGE_DELETED,
          'A message has been deleted in the group',
          messageId,
        );
      }
    }
  }

  async notifyEventCommunityCreated(
    groupId,
    groupUsers,
    eventId,
    adminGroupId,
  ) {
    for (const userId of groupUsers) {
      if (userId !== adminGroupId) {
        await this.sendNotification(
          userId,
          groupId,
          NotificationType.EVENT_CREATED,
          'A new event has been created',
          eventId,
        );
      }
    }
  }

  async notifyEventCommunityEdited(groupId, groupUsers, eventId, adminGroupId) {
    for (const userId of groupUsers) {
      if (userId !== adminGroupId) {
        await this.sendNotification(
          userId,
          groupId,
          NotificationType.EVENT_EDITED,
          'An event has been edited',
          eventId,
        );
      }
    }
  }

  async notifyEventCommunityRemoved(
    groupId,
    groupUsers,
    eventId,
    adminGroupId,
  ) {
    for (const userId of groupUsers) {
      if (userId !== adminGroupId) {
        await this.sendNotification(
          userId,
          groupId,
          NotificationType.EVENT_DELETED,
          'An event has been deleted',
          eventId,
        );
      }
    }
  }

  @SubscribeMessage('messageRead')
  handleMessageRead(
    @MessageBody() data: { messageId: string; readerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const socketId = this.userSocketMap.get(data.readerId);
    if (socketId) {
      this.server.to(socketId).emit('messageReadStatus', {
        messageId: data.messageId,
        readerId: data.readerId,
        timestamp: new Date(),
      });
    }
  }
}
