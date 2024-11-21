import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Publication } from './publication.entity';

@Entity()
export class FilePublication extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @ManyToOne(() => Publication, (publication) => publication.files)
  publication!: Publication;
}
