import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class FileComment extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @OneToOne(() => Comment, (comment) => comment.file)
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
