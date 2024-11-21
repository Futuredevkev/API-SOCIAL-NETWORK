import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseUUIDEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'date' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at!: Date;
}

export abstract class BaseEntityID {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @CreateDateColumn({ type: 'date' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at!: Date;
}
