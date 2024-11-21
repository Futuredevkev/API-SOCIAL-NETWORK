import { User } from '../../user/entities/user.entity';
import { BaseEntityID } from '../../utils/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Star extends BaseEntityID {
  @Column({ type: 'decimal' })
  stars: number;

  @ManyToOne(() => User, (user) => user.stars)
  user: User;
}
