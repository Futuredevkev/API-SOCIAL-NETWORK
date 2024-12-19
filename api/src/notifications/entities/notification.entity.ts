import { NotificationType } from 'src/enums/enum-notifications-type';
import { User } from 'src/user/entities/user.entity';
import { BaseUUIDEntity } from 'src/utils/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Notification extends BaseUUIDEntity {
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('text')
  message: string;

  @Column('uuid')
  relatedEntityId: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User)
  recipient: User;

  @ManyToOne(() => User)
  sender: User;
}
