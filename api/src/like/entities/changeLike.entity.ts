import { Publication } from '../../publication/entities/publication.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntityID } from '../../utils/base-entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class ChangeLike extends BaseEntityID {
  @ManyToOne(() => User, (user) => user.changeLikes)
  user: User;

  @ManyToOne(() => Publication, (publication) => publication.changeLikes)
  publication: Publication;
}
