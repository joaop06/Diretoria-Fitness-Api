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
  day: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  totalFaults: number;

  @Column({ default: 0 })
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
