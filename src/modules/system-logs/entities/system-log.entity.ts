import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LevelEnum } from '../enum/log-level.enum';

@Entity('system_logs')
export class SystemLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  env: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: LevelEnum,
    default: LevelEnum.INFO,
  })
  level: LevelEnum;

  @Column({ nullable: true })
  source: string; // Opcional, pode armazenar o módulo ou origem do log

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedat: Date;
}
