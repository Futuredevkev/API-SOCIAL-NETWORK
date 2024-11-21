import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Response } from './response.entity';

@Entity()
export class FileResponse extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @OneToOne(() => Response, (response) => response.file)
  @JoinColumn({ name: 'response_id' })
  response: Response;
}
