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
import { BetDaysEntity } from 'src/bet-days/bet-days.entity';
import { ParticipantsEntity } from 'src/participants/participants.entity';

@Entity('training_releases')
export class TrainingReleasesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imagePath: string;

  @Column()
  comment: string;

  @ManyToOne(
    () => ParticipantsEntity,
    (participant) => participant.trainingReleases,
  )
  @JoinColumn({ name: 'participantId' })
  participant: ParticipantsEntity;

  @ManyToOne(() => BetDaysEntity, (betDay) => betDay.trainingReleases)
  @JoinColumn({ name: 'betDayId' })
  betDay: BetDaysEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
