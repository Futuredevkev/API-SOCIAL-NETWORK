import { User } from './user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'file' })
export class File extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @OneToOne(() => User, (user) => user.file)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
