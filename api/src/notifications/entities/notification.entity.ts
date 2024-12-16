import { Comment } from "src/comments/entities/comment.entity";
import { Publication } from "src/publication/entities/publication.entity";
import { Response } from "src/responses/entities/response.entity";
import { User } from "src/user/entities/user.entity";
import { BaseUUIDEntity } from "src/utils/base-entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Notification extends BaseUUIDEntity {
  @Column()
  type: string; 

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User)
  recipient: User;

  @ManyToOne(() => Publication, { nullable: true })
  publication: Publication;

  @ManyToOne(() => Comment, { nullable: true })
  relatedComment: Comment;

  @ManyToOne(() => Response, { nullable: true })
  relatedResponse: Response;
}
