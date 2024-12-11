import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingTypeEnum } from '../enum/training-type.enum';
import { BetDaysEntity } from '../../bet-days/entities/bet-days.entity';
import { ParticipantsEntity } from '../../participants/entities/participants.entity';

@Entity('training_releases')
export class TrainingReleasesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TrainingTypeEnum })
  trainingType: TrainingTypeEnum;

  @Column({ default: '' })
  comment: string;

  @Column({ default: '' })
  imagePath: string;

  @ManyToOne(
    () => ParticipantsEntity,
    (participant) => participant.trainingReleases,
  )
  @JoinColumn({ name: 'participantId' })
  participant: ParticipantsEntity;

  @ManyToOne(() => BetDaysEntity, (betDay) => betDay.trainingReleases, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'betDayId' })
  betDay: BetDaysEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
