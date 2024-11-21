import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { GroupMessage } from './group-message.entity';
import { GroupUser } from './group-user.entity';

@Entity()
export class GroupChat extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => GroupUser, (groupUser) => groupUser.group)
  groupUsers: GroupUser[];

  @OneToMany(() => GroupMessage, (message) => message.group)
  messages: GroupMessage[];

  @Column({ type: 'timestamp', nullable: true })
  expiredAt!: Date;
}
