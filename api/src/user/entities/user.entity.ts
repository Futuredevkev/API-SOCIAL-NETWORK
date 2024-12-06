import { File } from './files.entity';
import { Address } from '../../address/entities/address.entity';
import { Roles } from '../../enums/enum.roles';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { Block } from './block.entity';
import { Report } from './report.entity';
import { Star } from '../../stars/entities/star.entity';
import { Publication } from '../../publication/entities/publication.entity';
import { NeedLike } from '../../like/entities/needLike.entity';
import { ChangeLike } from '../../like/entities/changeLike.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Response } from '../../responses/entities/response.entity';
import { Order } from '../../orders/entities/order.entity';
import { Community } from '../../comunities/entities/comunity.entity';
import { UserCommunity } from '../../comunities/entities/user.community.entity';
import { Event } from '../../events/entities/event.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { Message } from '../../chat/entities/messages.entity';
import { LikeMessage } from '../../chat/entities/likeMessage.entity';
import { GroupMessage } from '../../group-chat/entities/group-message.entity';
import { GroupUser } from '../../group-chat/entities/group-user.entity';
import { FaceFile } from './face_file.entity';
import { FavUser } from './fav_user.entity';
import { Verification } from './verification_user';
import { FilesVerificationUser } from './files-verification-user.entity';

@Entity()
export class User extends BaseUUIDEntity {
  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  lastname!: string;

  @Column({ unique: true, type: 'text' })
  email!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'text', unique: true })
  phoneNumber!: string;

  @Column({ type: 'date' })
  birthdate!: Date;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @Column('simple-json', { nullable: true })
  face_encoding: number[];

  @Column({ type: 'text', array: true, default: ['user'] })
  role!: Roles[];

  @Column('uuid', {
    array: true,
    nullable: true,
    default: [],
  })
  hiddenGroups: string[] = [];

  @Column({ type: 'text', nullable: true })
  passwordHidden?: string;

  @Column('uuid', {
    array: true,
    nullable: true,
    default: [],
  })
  hiddenChats: string[] = [];

  @Column({ type: 'text', nullable: true })
  verification_token?: string;

  @Column({ type: 'text', nullable: true })
  hash_refresh_token?: string;

  @Column({ nullable: true })
  pendingPassword: string | null;

  @Column({ nullable: true })
  pendingFileUrl: string | null;

  @Column({ default: false })
  pendingChangesConfirmed: boolean;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date;

  @OneToOne(() => Address, (address) => address.user, {
    cascade: true,
  })
  address?: Address;

  @OneToOne(() => File, (file) => file.user, {
    cascade: true,
  })
  file?: File;

  @OneToMany(
    () => FilesVerificationUser,
    (filesVerificationUser) => filesVerificationUser.user,
    {
      cascade: true,
    },
  )
  filesVerificationUser?: FilesVerificationUser;

  @OneToOne(() => FaceFile, (faceFile) => faceFile.user, {
    cascade: true,
  })
  faceFile?: FaceFile;

  @OneToMany(() => FavUser, (favUser) => favUser.user, { cascade: true })
  favoritesInitiated?: FavUser[];

  @OneToMany(() => Verification, (verification) => verification.user, {
    cascade: true,
  })
  verifications: Verification[];

  @OneToMany(() => FavUser, (favUser) => favUser.favoriteUser, {
    cascade: true,
  })
  favoritesReceived?: FavUser[];

  @OneToMany(() => Block, (block) => block.blockedBy, {
    cascade: true,
  })
  blocksInitiated: Block[];

  @OneToMany(() => Block, (block) => block.blockedUser, {
    cascade: true,
  })
  blocksReceived: Block[];

  @OneToMany(() => Report, (report) => report.reportedBy, {
    cascade: true,
  })
  reports: Report[];

  @OneToMany(() => Star, (star) => star.user, {
    cascade: true,
  })
  stars?: Star[];

  @OneToMany(() => Publication, (publication) => publication.user)
  publication?: Publication;

  @OneToMany(() => NeedLike, (needLike) => needLike.user, {
    cascade: true,
  })
  needLikes?: NeedLike[];

  @OneToMany(() => ChangeLike, (changeLike) => changeLike.user, {
    cascade: true,
  })
  changeLikes?: ChangeLike[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true,
  })
  comments?: Comment[];

  @OneToMany(() => Response, (response) => response.user, {
    cascade: true,
  })
  responses?: Response[];

  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];

  @OneToMany(() => Community, (community) => community.user)
  communitiesCreated?: Community[];

  @OneToMany(() => UserCommunity, (userCommunity) => userCommunity.user)
  userCommunities?: UserCommunity[];

  @OneToMany(() => Event, (event) => event.user, {
    cascade: true,
  })
  events?: Event[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages?: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages?: Message[];

  @OneToMany(() => Chat, (chat) => chat.sender)
  chatsAsSender?: Chat[];

  @OneToMany(() => Chat, (chat) => chat.receiver)
  chatsAsReceiver?: Chat[];

  @OneToMany(() => LikeMessage, (like) => like.user)
  likes?: LikeMessage[];

  @OneToMany(() => GroupUser, (groupUser) => groupUser.user)
  groupUsers: GroupUser[];

  @OneToMany(() => GroupMessage, (groupMessage) => groupMessage.sender)
  groupMessages?: GroupMessage[];
}
