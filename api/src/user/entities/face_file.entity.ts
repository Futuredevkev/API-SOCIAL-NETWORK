import { User } from './user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'face_file' })
export class FaceFile extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @OneToOne(() => User, (user) => user.faceFile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
