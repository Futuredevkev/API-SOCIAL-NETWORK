import { BaseUUIDEntity } from 'src/utils/base-entity';
import { Entity, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Verification extends BaseUUIDEntity {
  @ManyToOne(() => User, (user) => user.verifications)
  user: User;

  @Column({ type: 'simple-array', nullable: true })
  documentUrls: string[];

  @Column({ type: 'text', nullable: true })
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({ type: 'text', nullable: true })
  externalResponse: string;

  @CreateDateColumn()
  requestedAt: Date;
}
