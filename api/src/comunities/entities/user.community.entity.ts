import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntityID } from '../../utils/base-entity';
import { CommunityRoles } from '../../enums/enum.communities.roles';
import { Community } from './comunity.entity';

@Entity()
export class UserCommunity extends BaseEntityID {
  @ManyToOne(() => User, (user) => user.userCommunities)
  user: User;

  @ManyToOne(() => Community, (community) => community.userCommunities)
  community: Community;

  @Column({
    type: 'enum',
    enum: CommunityRoles,
    default: CommunityRoles.MEMBERGROUP,
  })
  role: CommunityRoles;
}
