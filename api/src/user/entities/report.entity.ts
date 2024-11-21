import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import { Reports } from '../../enums/enum.reports';

@Entity()
export class Report extends BaseUUIDEntity {
  @Column({ type: 'enum', enum: Reports })
  reportType: Reports;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User, (user) => user.reports, { eager: true })
  reportedBy: User;

  @ManyToOne(() => User)
  reportedUser: User;
}
