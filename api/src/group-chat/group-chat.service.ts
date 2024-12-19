import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupChat } from './entities/group-chat.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { GroupMessage } from './entities/group-message.entity';
import { User } from 'src/user/entities/user.entity';
import { FileGroup } from './entities/file-group.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { GroupUser } from './entities/group-user.entity';
import { RolesChatsGroup } from 'src/enums/enum-roles-groups-chat';
import { CreateSendMessageDto } from './dto/create-send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationGroupChatService } from 'src/common/pagination-Group.service';
import { NotificationGateway } from 'src/ws-notifications/ws-notifications.gateway';

@Injectable()
export class GroupChatService {
  constructor(
    @InjectRepository(GroupChat)
    private readonly groupChatRepository: Repository<GroupChat>,
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FileGroup)
    private readonly fileGroupRepository: Repository<FileGroup>,
    @InjectRepository(GroupUser)
    private readonly groupUserRepository: Repository<GroupUser>,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
    private readonly paginationGroupChatService: PaginationGroupChatService,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  async createGroup(
    createGroupChatDto: CreateGroupChatDto,
    userId: string,
    membersId: string[],
  ) {
    const { name, description } = createGroupChatDto;

    const authUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!authUser) {
      throw new NotFoundException('User not found');
    }

    const members = await this.userRepository.find({
      where: { id: In(membersId) },
    });

    if (members.length === 0) {
      throw new NotFoundException('Members not found');
    }

    const groupChat = this.groupChatRepository.create({
      name,
      description,
    });

    await this.groupChatRepository.save(groupChat);

    const groupUsers = [];

    const groupUserAdmin = this.groupUserRepository.create({
      group: { id: groupChat.id },
      user: authUser,
      role: RolesChatsGroup.ADMIN,
    });

    groupUsers.push(groupUserAdmin);

    members.forEach((member) => {
      const groupUserMembers = this.groupUserRepository.create({
        group: { id: groupChat.id },
        user: member,
        role: RolesChatsGroup.MEMBER,
      });

      groupUsers.push(groupUserMembers);
    });

    await this.groupUserRepository.save(groupUsers);

    const memberIds = members.map((member) => member.id);
    await this.notificationGateway.notifyGroupCreated(
      authUser.id,
      memberIds,
      groupChat.name,
      groupChat.id,
    );

    return {
      groupChat,
      groupUsers,
    };
  }

  async editGroup(
    groupId: string,
    userId: string,
    updateGroupChatDto: UpdateGroupChatDto,
  ) {
    const group = await this.groupChatRepository.findOne({
      where: { id: groupId },
      relations: ['groupUsers', 'groupUsers.user'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new NotFoundException('User not found');
    }

    const groupUser = group.groupUsers.find(
      (groupUser) => groupUser.user.id === userAuth.id,
    );

    if (
      !groupUser ||
      (groupUser.role !== RolesChatsGroup.ADMIN &&
        groupUser.role !== RolesChatsGroup.HELPER)
    ) {
      throw new ForbiddenException('User is not authorized to edit group');
    }

    const updatedGroup = await this.groupChatRepository.preload({
      id: group.id,
      ...updateGroupChatDto,
    });

    if (!updatedGroup) {
      throw new NotFoundException('Group update failed');
    }

    await this.groupChatRepository.save(updatedGroup);

    const groupUserIds = group.groupUsers.map((gu) => gu.user.id);
    await this.notificationGateway.notifyGroupEdited(
      group.id,
      userAuth.id,
      groupUserIds,
      group.name,
    );

    return { message: 'Group updated successfully' };
  }

  async addMembers(groupId: string, userId: string, membersId: string[]) {
    if (!membersId || membersId.length === 0) {
      throw new BadRequestException('No member IDs provided');
    }
    console.log('Members to add:', membersId);

    const group = await this.groupChatRepository.findOne({
      where: { id: groupId, is_active: true },
      relations: ['groupUsers', 'groupUsers.user'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }
    console.log('Group found:', group);

    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new NotFoundException('User not found');
    }
    console.log('Authenticated user:', authUser);

    const groupUser = group.groupUsers.find(
      (groupUser) => groupUser.user.id === authUser.id,
    );

    console.log('Group user found:', groupUser);

    if (
      !groupUser ||
      (groupUser.role !== RolesChatsGroup.ADMIN &&
        groupUser.role !== RolesChatsGroup.HELPER)
    ) {
      throw new ForbiddenException('User is not an admin or helper');
    }

    const newMembers = await this.userRepository.find({
      where: { id: In(membersId) },
    });

    console.log('New members found:', newMembers);

    if (newMembers.length === 0) {
      throw new NotFoundException('Members not found');
    }

    const existingMembers = group.groupUsers.map((gUser) => gUser.user.id);
    console.log('Existing members:', existingMembers);

    const membersToAdd = newMembers.filter(
      (member) => !existingMembers.includes(member.id),
    );
    console.log('Members to add after filtering:', membersToAdd);

    for (const member of membersToAdd) {
      const groupUser = this.groupUserRepository.create({
        group,
        user: member,
        role: RolesChatsGroup.MEMBER,
      });
      console.log('Saving new group user:', groupUser);
      await this.groupUserRepository.save(groupUser);

      await this.notificationGateway.notifyGroupMemberAdded(
        group.id,
        authUser.id,
        member.id,
        group.name,
      );
    }

    return { message: 'Members added successfully' };
  }

  async deleteMembers(groupId: string, membersId: string[], userId: string) {
    const group = await this.groupChatRepository.findOne({
      where: { id: groupId },
      relations: ['groupUsers', 'groupUsers.user'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new NotFoundException('User not found');
    }

    const groupUser = group.groupUsers.find(
      (groupUser) => groupUser.user.id === userAuth.id,
    );

    if (
      !groupUser ||
      (groupUser.role !== RolesChatsGroup.ADMIN &&
        groupUser.role !== RolesChatsGroup.HELPER)
    ) {
      throw new ForbiddenException('User is not authorized to delete members');
    }

    const adminUser = group.groupUsers.find(
      (groupUser) => groupUser.role === RolesChatsGroup.ADMIN,
    );

    if (membersId.includes(adminUser.user.id)) {
      throw new ForbiddenException('Cannot remove the group admin');
    }

    const membersToRemove = group.groupUsers.filter((gUser) => {
      return membersId.includes(gUser.id);
    });

    if (membersToRemove.length === 0) {
      throw new NotFoundException('Members to remove not found');
    }

    for (const member of membersToRemove) {
      console.log('Eliminando miembro:', member);
      await this.groupUserRepository.remove(member);

      await this.notificationGateway.notifyGroupMemberRemoved(
        group.id,
        userAuth.id,
        member.user.id,
        group.name,
      );
    }

    return { message: 'Members removed successfully' };
  }

  async getUserGroups(userId: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      select: {
        id: true,
        name: true,
        lastname: true,
        hiddenGroups: true,
        file: {
          url: true,
        },
      },
    });

    if (!userAuth) {
      throw new ForbiddenException('User is not authenticated or inactive');
    }

    const groups = await this.groupChatRepository.find({
      relations: ['groupUsers', 'messages'],
      where: { groupUsers: { user: { id: userAuth.id } } },
      select: {
        id: true,
        name: true,
        groupUsers: {
          created_at: true,
        },
        messages: {
          content: true,
          created_at: true,
        },
      },
    });

    if (!groups || groups.length === 0) {
      return { user: userAuth, groups: [] };
    }

    const hiddenGroups = Array.isArray(userAuth.hiddenGroups)
      ? userAuth.hiddenGroups
      : [];

    const visibleGroups = groups.filter((group) => {
      return !hiddenGroups.includes(group.id);
    });

    const userGroups = visibleGroups.map((group) => {
      const lastMessage =
        group.messages && group.messages.length > 0
          ? group.messages[group.messages.length - 1]
          : null;

      return {
        groupName: group.name,
        joinedAt: group.groupUsers[0]?.created_at,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.created_at,
            }
          : null,
      };
    });

    return {
      user: userAuth,
      groups: userGroups,
    };
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await this.groupChatRepository.findOne({
      where: { id: groupId },
      relations: ['groupUsers', 'groupUsers.user', 'messages'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new ForbiddenException('User is not authenticated');
    }

    const groupUser = group.groupUsers.find(
      (groupUser) => groupUser.user.id === userAuth.id,
    );

    if (!groupUser || groupUser.role !== RolesChatsGroup.ADMIN) {
      throw new ForbiddenException(
        'User is not authorized to delete this group',
      );
    }

    const messageIds = group.messages.map((message) => message.id);

    const deletedFiles = await this.fileGroupRepository.find({
      where: { groupMessage: In(messageIds) },
    });

    if (deletedFiles.length > 0) {
      await Promise.all(
        deletedFiles.map(async (file) => {
          const fileToUpdate = await this.fileGroupRepository.preload({
            id: file.id,
            is_active: false,
          });

          if (fileToUpdate) {
            await this.fileGroupRepository.save(fileToUpdate);
          }
        }),
      );
    }

    await Promise.all(
      group.messages.map(async (message) => {
        const messageToUpdate = await this.groupMessageRepository.preload({
          id: message.id,
          is_active: false,
        });

        if (messageToUpdate) {
          await this.groupMessageRepository.save(messageToUpdate);
        }
      }),
    );

    const groupToDelete = await this.groupChatRepository.preload({
      id: group.id,
      is_active: false,
    });

    await this.groupChatRepository.save(groupToDelete);

    const groupUserIds = group.groupUsers.map((gu) => gu.user.id);
    await this.notificationGateway.notifyGroupDeleted(
      group.id,
      userAuth.id,
      groupUserIds,
      group.name,
    );

    return { message: 'Group deleted successfully' };
  }

  async leaveGroup(groupId: string, userId: string) {
    const group = await this.groupChatRepository.findOne({
      where: { id: groupId },
      relations: ['groupUsers', 'groupUsers.user'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new ForbiddenException('User is not authenticated');
    }

    const groupUser = group.groupUsers.find(
      (groupUser) => groupUser.user.id === userAuth.id,
    );

    if (!groupUser) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const admins = group.groupUsers.filter(
      (groupUser) => groupUser.role === RolesChatsGroup.ADMIN,
    );
    if (groupUser.role === RolesChatsGroup.ADMIN && admins.length === 1) {
      throw new ForbiddenException(
        'Cannot leave the group as you are the only admin',
      );
    }

    await this.groupUserRepository.remove(groupUser);

    await this.notificationGateway.notifyYourselfGroupMemberRemoved(
      group.id,
      userAuth.id,
      group.name, 
    );

    return { message: 'You have left the group successfully' };
  }

  async sendMessageGroup(
    groupId: string,
    userId: string,
    createMessageDto: CreateSendMessageDto,
    files: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { content } = createMessageDto;

    try {
      const group = await queryRunner.manager.findOne(GroupChat, {
        where: { id: groupId },
        relations: ['groupUsers'],
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const member = await queryRunner.manager.findOne(GroupUser, {
        where: {
          user: { id: userId, is_active: true },
          group: { id: groupId },
        },
        relations: ['user'],
      });

      if (!member) {
        throw new ForbiddenException('You are not a member of this group');
      }

      const filesMessage = await Promise.all(
        files.map(async (file) => {
          let uploadFile;
          console.log('Procesando archivo:', file.originalname);

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

          console.log('Archivo subido:', uploadFile.url);
          const savedFile = queryRunner.manager.create(FileGroup, {
            url: uploadFile.url,
          });

          return queryRunner.manager.save(FileGroup, savedFile);
        }),
      );

      const message = queryRunner.manager.create(GroupMessage, {
        group,
        sender: member.user,
        content: content,
        files: filesMessage,
      });

      await queryRunner.manager.save(GroupMessage, message);

      const groupUserIds = group.groupUsers.map((gu) => gu.user.id);
      await this.notificationGateway.notifyNewGroupMessage(
        group.id,
        userId,
        createMessageDto.content,
        groupUserIds,
      );

      await queryRunner.commitTransaction();

      return { message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error en sendMessage:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error while sending message');
    } finally {
      await queryRunner.release();
      console.log('QueryRunner liberado');
    }
  }

  async deleteMessage(messageId: string, groupId: string, userId: string) {
    const authUser = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!authUser) {
      throw new NotFoundException('User not found');
    }

    const group = await this.groupChatRepository.findOne({
      where: { id: groupId, is_active: true },
    });

    console.log(group);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const message = await this.groupMessageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.id !== authUser.id) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    const deletedFiles = await this.fileGroupRepository.find({
      where: { groupMessage: { id: message.id } },
    });

    if (deletedFiles.length > 0) {
      await Promise.all(
        deletedFiles.map(async (file) => {
          const fileToUpdate = await this.fileGroupRepository.preload({
            id: file.id,
            is_active: false,
          });

          if (fileToUpdate) {
            await this.fileGroupRepository.save(fileToUpdate);
          }
        }),
      );
    }

    const deletedMessage = await this.groupMessageRepository.preload({
      id: message.id,
      is_active: false,
    });

    await this.groupMessageRepository.save(deletedMessage);

    const groupUserIds = group.groupUsers.map((gu) => gu.user.id);
    await this.notificationGateway.notifyGroupMessageDeleted(
      group.id,
      authUser.id,
      groupUserIds,
      message.id,
    );

    return { message: 'Message deleted successfully' };
  }

  async hideGroupChat(groupId: string, userId: string, passwordHidden: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new NotFoundException('User not found');
    }

    const group = await this.groupChatRepository.findOne({
      where: { id: groupId, is_active: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isGroupHidden = userAuth.hiddenGroups.includes(groupId);

    if (!isGroupHidden) {
      userAuth.hiddenGroups.push(groupId);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passwordHidden, salt);
      userAuth.passwordHidden = hashedPassword;
      group.expiredAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await this.groupChatRepository.save(group);
      await this.userRepository.save(userAuth);
    }

    return { message: 'Group hidden' };
  }

  async showHiddenGroups(userId: string, passwordHidden: string) {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      select: {
        id: true,
        name: true,
        lastname: true,
        hiddenGroups: true,
        passwordHidden: true,
      },
    });

    if (!userAuth) {
      throw new NotFoundException('User not found or inactive');
    }

    if (!passwordHidden) {
      throw new BadRequestException('Password is required');
    }

    if (!userAuth.passwordHidden) {
      throw new ForbiddenException('No hidden groups to show');
    }

    const isPasswordValid = await bcrypt.compare(
      passwordHidden,
      userAuth.passwordHidden,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Incorrect password');
    }

    const hiddenGroupsIds = Array.isArray(userAuth.hiddenGroups)
      ? userAuth.hiddenGroups
      : [];

    // Validar si hay IDs de grupos ocultos
    if (hiddenGroupsIds.length === 0) {
      return {
        user: {
          id: userAuth.id,
          name: userAuth.name,
          lastname: userAuth.lastname,
        },
        hiddenGroups: [],
      };
    }

    const hiddenGroups = await this.groupChatRepository.find({
      where: { id: In(hiddenGroupsIds) },
      relations: ['groupUsers', 'messages'],
      select: {
        id: true,
        name: true,
        groupUsers: {
          created_at: true,
        },
        messages: {
          content: true,
          created_at: true,
        },
      },
    });

    const hiddenUserGroups = hiddenGroups.map((group) => {
      const lastMessage =
        group.messages && group.messages.length > 0
          ? group.messages[group.messages.length - 1]
          : null;

      return {
        groupName: group.name,
        joinedAt: group.groupUsers[0]?.created_at,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.created_at,
            }
          : null,
      };
    });

    return {
      user: {
        id: userAuth.id,
        name: userAuth.name,
        lastname: userAuth.lastname,
      },
      hiddenGroups: hiddenUserGroups,
    };
  }
  async editMessage(
    messageId: string,
    groupId: string,
    userId: string,
    updateMessageDto: UpdateMessageDto,
    files: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { ids_images } = updateMessageDto;

    try {
      let fileUploads: FileGroup[] = [];
      let filesInDb: FileGroup[] = [];

      const userAuth = await queryRunner.manager.findOne(User, {
        where: { id: userId, is_active: true },
      });

      if (!userAuth) {
        throw new NotFoundException('User not found');
      }

      const group = await queryRunner.manager.findOne(GroupChat, {
        where: { id: groupId, is_active: true },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const message = await queryRunner.manager.findOne(GroupMessage, {
        where: { id: messageId },
        relations: ['sender', 'files'],
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      if (message.sender.id !== userAuth.id) {
        throw new ForbiddenException('You can only edit your own messages');
      }

      if (ids_images && ids_images.length > 0) {
        filesInDb = await queryRunner.manager.find(FileGroup, {
          where: { id: In(ids_images) },
        });

        if (ids_images.length !== filesInDb.length) {
          throw new NotFoundException(`One of the images was not found`);
        }

        await Promise.all(
          filesInDb.map(async (file) => {
            await queryRunner.manager.remove(FileGroup, file);
            console.log('f', file);
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

            const fileGroup = queryRunner.manager.create(FileGroup, {
              url: uploadFile.url,
            });

            return await queryRunner.manager.save(fileGroup);
          }),
        );

        fileUploads = uploads;
      }

      const updatedMessageGroup = await queryRunner.manager.preload(
        GroupMessage,
        {
          id: message.id,
          content: updateMessageDto.content,
          files: fileUploads,
          group: { id: groupId },
        },
      );

      if (!updatedMessageGroup) {
        throw new NotFoundException('Message not found for update');
      }

      await queryRunner.manager.save(updatedMessageGroup);

      const groupUserIds = group.groupUsers.map((gu) => gu.user.id);
      await this.notificationGateway.notifyGroupMessageEdited(
        group.id,
        userAuth.id,
        groupUserIds,
        message.id,
      );

      await queryRunner.commitTransaction();

      return { message: 'Message updated successfully' };
    } catch (error) {
      console.error('Error updating message:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllMessagesGroup(
    groupId: string,
    userId: string,
    paginationDto: PaginationDto,
  ) {
    const group = await this.groupChatRepository.findOne({
      where: { id: groupId },
      relations: [
        'messages',
        'messages.sender',
        'groupUsers',
        'groupUsers.user',
      ],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userAuth = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!userAuth) {
      throw new ForbiddenException('User is not authenticated');
    }

    const isMember = group.groupUsers.some(
      (groupUser) => groupUser.user.id === userAuth.id,
    );

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    if (userAuth.hiddenGroups.includes(group.id)) {
      throw new ForbiddenException(
        'You cannot access messages from this group',
      );
    }

    const { messages, meta } =
      await this.paginationGroupChatService.paginateMessages(
        groupId,
        paginationDto,
        {
          where: {
            group: { id: groupId },
          },
          relations: ['sender'],
        },
      );

    const messagesWithSender = messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        lastname: message.sender.lastname,
      },
    }));

    return {
      groupName: group.name,
      messages: messagesWithSender,
      pagination: meta,
    };
  }

  async searchGroups(userId: string, searchTerm: string) {
    const userGroups = await this.groupUserRepository.find({
      where: { user: { id: userId } },
      relations: ['group'],
    });

    if (!userGroups) {
      throw new NotFoundException('Group not found');
    }

    const groupIds = userGroups.map((groupUser) => groupUser.group.id);

    if (groupIds.length === 0) {
      throw new NotFoundException('User is not a member of any group');
    }

    const groups = await this.groupChatRepository.find({
      where: [
        { id: In(groupIds), name: Like(`%${searchTerm}%`) },
        { id: In(groupIds), description: Like(`%${searchTerm}%`) },
      ],
      relations: [
        'groupUsers',
        'groupUsers.user',
        'messages',
        'messages.sender',
      ],
    });

    return groups.map((group) => {
      const groupLastMessage =
        group.messages && group.messages.length > 0
          ? group.messages[group.messages.length - 1]
          : null;

      const lastMessageUserName =
        groupLastMessage && groupLastMessage.sender
          ? `${groupLastMessage.sender.name} ${groupLastMessage.sender.lastname}`
          : null;

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        lastMessage: groupLastMessage,
        lastMessageUser: lastMessageUserName,
      };
    });
  }

  async searchMessagesInGroup(
    groupId: string,
    userId: string,
    searchTerm: string,
  ) {
    const group = await this.groupChatRepository.findOne({
      where: { id: groupId, is_active: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userInGroup = await this.groupUserRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (!userInGroup) {
      throw new ForbiddenException('User is not a member of this group');
    }

    const messages = await this.groupMessageRepository.find({
      where: {
        group: { id: groupId },
        content: Like(`%${searchTerm}%`),
      },
      relations: ['sender'],
    });

    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.created_at,
      senderName: `${message.sender.name} ${message.sender.lastname}`,
      senderPhoto: message.sender.file?.url || null,
    }));
  }
}
