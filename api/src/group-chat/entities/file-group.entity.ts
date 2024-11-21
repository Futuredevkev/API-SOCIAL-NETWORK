import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GroupMessage } from './group-message.entity';

@Entity()
export class FileGroup extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @ManyToOne(() => GroupMessage, (groupMessage) => groupMessage.files)
  groupMessage!: GroupMessage;
}
