import {
  Entity,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('ranking')
export class RankingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  score: number;

  @Column()
  userId: number;

  @OneToOne(() => UsersEntity, (user) => user.ranking)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
