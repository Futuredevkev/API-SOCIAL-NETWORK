import { BaseUUIDEntity } from '../../utils/base-entity';
import { User } from '../../user/entities/user.entity';
import { GroupChat } from './group-chat.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { RolesChatsGroup } from '../../enums/enum-roles-groups-chat';

@Entity()
export class GroupUser extends BaseUUIDEntity {
  @ManyToOne(() => GroupChat, (group) => group.groupUsers)
  group: GroupChat;

  @ManyToOne(() => User, (user) => user.groupUsers)
  user: User;

  @Column({
    type: 'enum',
    enum: RolesChatsGroup,
    default: RolesChatsGroup.MEMBER,
  })
  role: RolesChatsGroup;
}
