import { Transform } from 'class-transformer';
import { TrainingBetEntity } from '../../training-bets/entities/training-bet.entity';
import { TrainingReleasesEntity } from '../../training-releases/entities/training-releases.entity';
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

  @Transform(({ value }) => parseFloat(value))
  @Column('decimal', { precision: 5, scale: 2, default: 0.0 })
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
