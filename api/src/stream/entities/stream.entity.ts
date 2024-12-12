import { User } from 'src/user/entities/user.entity';
import { BaseUUIDEntity } from 'src/utils/base-entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Stream extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ unique: true })
  streamKey: string;

  @Column()
  previewImageUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  @ManyToOne(() => User, (user) => user.streams, { onDelete: 'CASCADE' })
  user: User;
}
