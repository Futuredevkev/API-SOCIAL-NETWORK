import { MethodPays } from '../../enums/enum-method-pay';
import { StatusPay } from '../../enums/enum-status-pay';


import { User } from '../../user/entities/user.entity';
import { BaseUUIDEntity } from '../../utils/base-entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class Order extends BaseUUIDEntity {
  @Column('decimal')
  amount: number;

  @Column()
  email: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: StatusPay, default: StatusPay.PENDING })
  status: StatusPay;

  @Column({ type: 'enum', enum: MethodPays, default: MethodPays.PAYPAL })
  method: MethodPays;

  @Column({ nullable: true })
  paymentId: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;
}
