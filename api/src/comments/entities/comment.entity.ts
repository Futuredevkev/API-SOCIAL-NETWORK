import { Publication } from '../../publication/entities/publication.entity';
import { Response } from '../../responses/entities/response.entity';
import { User } from '../../user/entities/user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { FileComment } from './file-comment.entity';

@Entity()
export class Comment extends BaseUUIDEntity {
  @Column()
  content!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @ManyToOne(() => User, (user) => user.comments)
  user!: User;

  @ManyToOne(() => Publication, (publication) => publication.comments)
  publication!: Publication;

  @OneToMany(() => Response, (response) => response.comment)
  responses!: Response[];

  @OneToOne(() => FileComment, (file) => file.comment, { cascade: true })
  file?: FileComment;
}
