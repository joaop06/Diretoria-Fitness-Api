import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { TrainingBetEntity } from '../../training-bets/entities/training-bet.entity';
import { TrainingReleasesEntity } from '../../training-releases/entities/training-releases.entity';

@Entity('bet_days')
export class BetDaysEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  totalFaults: number;

  @Column({ type: 'decimal', default: 0.0 })
  utilization: number;

  @ManyToOne(() => TrainingBetEntity, (trainingBet) => trainingBet.betDays, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingBetId' })
  trainingBet: TrainingBetEntity;

  @OneToMany(
    () => TrainingReleasesEntity,
    (trainingReleases) => trainingReleases.betDay,
  )
  trainingReleases: TrainingReleasesEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
