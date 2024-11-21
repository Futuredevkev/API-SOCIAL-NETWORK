import { Publication } from '../../publication/entities/publication.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntityID } from '../../utils/base-entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class NeedLike extends BaseEntityID {
  @ManyToOne(() => User, (user) => user.needLikes)
  user: User;

  @ManyToOne(() => Publication, (publication) => publication.needLikes)
  publication: Publication;
}
