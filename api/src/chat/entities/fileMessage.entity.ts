import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Message } from './messages.entity';

@Entity()
export class FileMessage extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @ManyToOne(() => Message, (message) => message.files)
  message!: Message;
}
