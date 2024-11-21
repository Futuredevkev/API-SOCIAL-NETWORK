import { ItemTag } from '../../enums/enum.tags';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { NeedLike } from '../../like/entities/needLike.entity';
import { ChangeLike } from '../../like/entities/changeLike.entity';
import { categoryTag } from '../../enums/enum.category';
import { Comment } from '../../comments/entities/comment.entity';
import { Response } from '../../responses/entities/response.entity';
import { FilePublication } from './filePublication.entity';
import { Community } from '../../comunities/entities/comunity.entity';

@Entity()
export class Publication extends BaseUUIDEntity {
  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ type: 'enum', enum: ItemTag })
  tag!: ItemTag;

  @Column({ type: 'enum', enum: categoryTag })
  category!: categoryTag;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @OneToMany(() => FilePublication, (file) => file.publication, {
    cascade: true,
  })
  files!: FilePublication[];

  @ManyToOne(() => User, (user) => user.publication, { cascade: true })
  @JoinColumn()
  user!: User;

  @OneToMany(() => NeedLike, (needLike) => needLike.publication)
  needLikes!: NeedLike[];

  @OneToMany(() => ChangeLike, (changeLike) => changeLike.publication)
  changeLikes!: ChangeLike[];

  @OneToMany(() => Comment, (comment) => comment.publication)
  comments!: Comment[];

  @OneToMany(() => Response, (response) => response.publication)
  responses!: Response[];

  @ManyToOne(() => Community, (community) => community.publications, {
    nullable: true,
  })
  @JoinColumn()
  community?: Community;

  
}
