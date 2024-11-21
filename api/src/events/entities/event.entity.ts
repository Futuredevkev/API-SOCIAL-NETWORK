import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { FileEvent } from './file.event.entity';
import { Community } from '../../comunities/entities/comunity.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Event extends BaseUUIDEntity {
  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column()
  start_date!: Date;

  @Column()
  end_date!: Date;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @OneToOne(() => FileEvent, (file) => file.event, { cascade: true })
  file?: FileEvent;

  @ManyToOne(() => Community, (community) => community.events)
  community!: Community;

  @ManyToOne(() => User, (user) => user.events)
  user!: User;
}
