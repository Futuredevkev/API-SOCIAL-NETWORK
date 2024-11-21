import { User } from '../../user/entities/user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Address extends BaseUUIDEntity {
  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  latitude?: number;

  @Column({ nullable: true })
  longitude?: number;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @OneToOne(() => User, (user) => user.address)
  @JoinColumn()
  user!: User;
}
