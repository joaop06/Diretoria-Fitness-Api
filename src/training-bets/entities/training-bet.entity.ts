import {
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { BetDaysEntity } from '../../bet-days/entities/bet-days.entity';
import { ParticipantsEntity } from '../../participants/entities/participants.entity';

@Entity('training_bets')
export class TrainingBetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  duration: number;

  @Column({ type: 'date' })
  initialDate: Date;

  @Column({ type: 'date' })
  finalDate: Date;

  @Column()
  faultsAllowed: number;

  // @Transform(({ value }) => parseFloat(value))
  @Column({ default: 0.0, nullable: false })
  minimumPenaltyAmount: number;

  @Column({
    type: 'enum',
    enum: ['Encerrada', 'Em Andamento', 'Agendada'],
    default: 'Agendada',
  })
  status: 'Encerrada' | 'Em Andamento' | 'Agendada';

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
