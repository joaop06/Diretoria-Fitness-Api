import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { RankingEntity } from '../../ranking/entities/ranking.entity';
import { UsersLogEntity } from '../../users-logs/entities/users-log.entity';
import { ParticipantsEntity } from '../../participants/entities/participants.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, length: 100 })
  username: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationCode: number; // Código de Verificação

  @Column({ type: 'datetime', nullable: true })
  verificationCodeAt?: Date;

  /**
   * Ex: 123.4
   * precision -> Total de Dígitos: 4
   * scale: -> Casas decimais: 1
   */
  @Transform(({ value }) => parseFloat(value))
  @Column('decimal', { precision: 5, scale: 2, default: 0.0 })
  weight: number;

  @Transform(({ value }) => parseFloat(value))
  @Column('decimal', { precision: 3, scale: 2, default: 0.0 })
  height: number;

  @Transform(({ value }) => parseFloat(value))
  @Column('decimal', { precision: 5, scale: 2, default: 0.0 })
  bmi: number; // Body Mass Index (Índice de Massa Corporal)

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  totalFaults: number;

  @Column({ default: 0 })
  totalTrainingDays: number;

  @Column({ default: 0 })
  totalParticipations: number;

  @Column()
  profileImagePath: string;

  @OneToMany(() => ParticipantsEntity, (participant) => participant.user)
  participants: ParticipantsEntity[];

  @OneToOne(() => RankingEntity, (ranking) => ranking.user, { cascade: true })
  @JoinColumn({ name: 'rankingId' })
  ranking: RankingEntity;

  @OneToMany(() => UsersLogEntity, (userLogs) => userLogs.user)
  userLogs: UsersLogEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
