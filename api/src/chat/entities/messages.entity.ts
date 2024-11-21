import { Chat } from '../../chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FileMessage } from './fileMessage.entity';
import {  LikeMessage } from './likeMessage.entity';

@Entity()
export class Message extends BaseUUIDEntity {
  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  receiver: User;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @Column()
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  sentAt: Date;

  @OneToMany(() => LikeMessage, (like) => like.message)
  likes: LikeMessage[];

  @OneToMany(() => FileMessage, (file) => file.message)
  files?: FileMessage[];
}
