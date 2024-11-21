import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Block extends BaseUUIDEntity {
  @ManyToOne(() => User, (user) => user.blocksInitiated, { nullable: false })
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User;

  @ManyToOne(() => User, (user) => user.blocksReceived, { nullable: false })
  @JoinColumn({ name: 'blocked_user' })
  blockedUser: User;

  @Column({ type: 'boolean' })
  blocked: boolean;
}
