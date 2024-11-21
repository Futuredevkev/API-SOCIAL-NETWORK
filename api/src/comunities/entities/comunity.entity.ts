import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { FileCommunity } from './file.comunities.entity';
import { UserCommunity } from './user.community.entity';
import { Publication } from '../../publication/entities/publication.entity';

@Entity()
export class Community extends BaseUUIDEntity {
  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @OneToOne(() => FileCommunity, (file) => file.community, { cascade: true })
  file?: FileCommunity;

  @ManyToOne(() => User, (user) => user.communitiesCreated)
  user!: User;

  @OneToMany(() => Event, (event) => event.community)
  events!: Event[];

  @OneToMany(() => UserCommunity, (userCommunity) => userCommunity.community)
  userCommunities!: UserCommunity[];

  @OneToMany(() => Publication, (publication) => publication.community)
  publications!: Publication[];
}
