import { Comment } from '../../comments/entities/comment.entity';
import { Publication } from '../../publication/entities/publication.entity';
import { User } from '../../user/entities/user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { FileResponse } from './file-response.entity';

@Entity()
export class Response extends BaseUUIDEntity {
  @Column()
  content!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @ManyToOne(() => User, (user) => user.responses)
  user!: User;

  @ManyToOne(() => Publication, (publication) => publication.responses)
  publication!: Publication;

  @ManyToOne(() => Comment, (comment) => comment.responses)
  comment!: Comment;

  @OneToOne(() => FileResponse, (file) => file.response, { cascade: true })
  file?: FileResponse;
}
