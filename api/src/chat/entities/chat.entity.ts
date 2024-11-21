import { User } from '../../user/entities/user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Message } from './messages.entity';

@Entity()
export class Chat extends BaseUUIDEntity {
  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @ManyToOne(() => User, (user) => user.chatsAsSender)
  sender: User;

  @ManyToOne(() => User, (user) => user.chatsAsReceiver)
  receiver: User;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt!: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
