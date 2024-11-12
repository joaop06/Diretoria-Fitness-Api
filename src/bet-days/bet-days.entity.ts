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
import { TrainingBetEntity } from 'src/training-bet/training-bet.entity';
import { TrainingReleasesEntity } from 'src/training-releases/training-releases.entity';

@Entity('bet_days')
export class BetDaysEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameDay: string;

  @Column({ default: 0 })
  totalFaults: number;

  @Column()
  utilization: number;

  @ManyToOne(() => TrainingBetEntity, (trainingBet) => trainingBet.betDays)
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
