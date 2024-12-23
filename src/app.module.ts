import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { dataSourceOptions } from '../config/data-source';

import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { EmailService } from './email/email.service';
import { JwtAuthGuard } from './auth/jwt/jwt-auth-guard';
import { RankingModule } from './ranking/ranking.module';
import { BetDaysModule } from './bet-days/bet-days.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';
import { UsersLogsModule } from './users-logs/users-logs.module';
import { SystemLogsModule } from './system-logs/system-logs.module';
import { ParticipantsModule } from './participants/participants.module';
import { TrainingBetsModule } from './training-bets/training-bets.module';
import { TrainingReleasesModule } from './training-releases/training-releases.module';

@Module({
  imports: [
    AuthModule,
    EmailModule,
    UsersModule,
    BetDaysModule,
    RankingModule,
    CronJobsModule,
    UsersLogsModule,
    SystemLogsModule,
    ParticipantsModule,
    TrainingBetsModule,
    TrainingReleasesModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ServeStaticModule.forRoot({
      serveRoot: '/uploads', // Prefixo da URL
      rootPath: '../public/imagesReleases', // Caminho da pasta de uploads
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }, EmailService],
})
export class AppModule { }
