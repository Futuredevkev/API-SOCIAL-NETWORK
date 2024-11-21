import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { GroupChat } from './group-chat.entity';
import { User } from '../../user/entities/user.entity';
import { FileGroup } from './file-group.entity';

@Entity()
export class GroupMessage extends BaseUUIDEntity {
  @ManyToOne(() => GroupChat, (group) => group.messages)
  @JoinColumn()
  group: GroupChat;

  @ManyToOne(() => User, (user) => user.groupMessages)
  @JoinColumn()
  sender: User;

  @Column()
  content: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => FileGroup, (file) => file.groupMessage, { cascade: true })
  files: FileGroup[];
}
