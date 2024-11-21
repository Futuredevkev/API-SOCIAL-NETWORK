import { User } from '../../user/entities/user.entity';
import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './messages.entity';
import { BaseEntityID } from '../../utils/base-entity';

@Entity()
export class LikeMessage extends BaseEntityID {
  @ManyToOne(() => User, (user) => user.likes, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Message, (message) => message.likes)
  @JoinColumn({ name: 'message_id' })
  message: Message;
}
