import { config } from 'dotenv';
config();

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { dataSourceOptions } from '../config/data-source';

import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { JwtAuthGuard } from './guards/jwt/jwt-auth.guard';
import { UsersModule } from './modules/users/users.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { BetDaysModule } from './modules/bet-days/bet-days.module';
import { CronJobsModule } from './modules/cron-jobs/cron-jobs.module';
import { UsersLogsModule } from './modules/users-logs/users-logs.module';
import { SystemLogsModule } from './modules/system-logs/system-logs.module';
import { OnlyHomologGuard } from './guards/homolog/only-homologation.guard';
import { ParticipantsModule } from './modules/participants/participants.module';
import { TrainingBetsModule } from './modules/training-bets/training-bets.module';
import { TrainingReleasesModule } from './modules/training-releases/training-releases.module';

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
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: OnlyHomologGuard },
  ],
})
export class AppModule { }
