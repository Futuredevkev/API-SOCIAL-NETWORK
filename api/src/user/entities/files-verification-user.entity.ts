import { User } from './user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class FilesVerificationUser extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @ManyToOne(() => User, (user) => user.file)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
