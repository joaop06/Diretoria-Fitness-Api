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

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/jwt/jwt-auth-guard';
import { RankingModule } from './ranking/ranking.module';
import { BetDaysModule } from './bet-days/bet-days.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';
import { SystemLogsModule } from './system-logs/system-logs.module';
import { ParticipantsModule } from './participants/participants.module';
import { TrainingBetsModule } from './training-bets/training-bets.module';
import { TrainingReleasesModule } from './training-releases/training-releases.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BetDaysModule,
    RankingModule,
    SystemLogsModule,
    ParticipantsModule,
    TrainingBetsModule,
    TrainingReleasesModule,
    TypeOrmModule.forRoot({
      cache: false,
      type: 'mysql',
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USERNAME,
      port: parseInt(process.env.DB_PORT),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ServeStaticModule.forRoot({
      serveRoot: '/uploads', // Prefixo da URL
      rootPath: '../public/imagesReleases', // Caminho da pasta de uploads
    }),
    CronJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
