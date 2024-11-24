import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { UsersEntity } from '../../users/entities/users.entity';
import { TrainingBetEntity } from '../../training-bets/entities/training-bet.entity';
import { TrainingReleasesEntity } from '../../training-releases/entities/training-releases.entity';

@Entity('participants')
export class ParticipantsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  faults: number;

  @Column({ default: false })
  declassified: boolean;

  @Transform(({ value }) => parseFloat(value))
  @Column({ type: 'decimal', default: 0.0 })
  utilization: number;

  @ManyToOne(() => UsersEntity, (user) => user.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(
    () => TrainingBetEntity,
    (trainingBet) => trainingBet.participants,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'trainingBetId' })
  trainingBet: TrainingBetEntity;

  @OneToMany(
    () => TrainingReleasesEntity,
    (trainingRelease) => trainingRelease.participant,
  )
  trainingReleases: TrainingReleasesEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
