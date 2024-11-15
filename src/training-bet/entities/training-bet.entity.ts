import {
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BetDaysEntity } from '../../bet-days/entities/bet-days.entity';
import { ParticipantsEntity } from '../../participants/entities/participants.entity';

@Entity('training_bet')
export class TrainingBetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  duration: number;

  @Column()
  initialDate: Date;

  @Column()
  finalDate: Date;

  @Column()
  faultsAllowed: number;

  @Column()
  minimumPenaltyAmount: number;

  @Column({ default: false })
  completed: boolean;

  @OneToMany(() => ParticipantsEntity, (participant) => participant.trainingBet)
  participants: ParticipantsEntity[];

  @OneToMany(() => BetDaysEntity, (betDay) => betDay.trainingBet)
  betDays: BetDaysEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
