import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class FileEvent extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @OneToOne(() => Event, (event) => event.file)
  @JoinColumn({ name: 'event_id' })
  event!: Event;
}
