import { BaseUUIDEntity } from '../../utils/base-entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { Community } from './comunity.entity';


@Entity()
export class FileCommunity extends BaseUUIDEntity {
  @Column({ type: 'text', nullable: false })
  url!: string;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @OneToOne(() => Community, (community) => community.file)
  community!: Community;
}
