import * as dotenv from 'dotenv';
dotenv.config();

import { join } from 'path';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BetDaysModule } from './bet-days/bet-days.module';
import { TrainingBetModule } from './training-bet/training-bet.module';
import { ParticipantsModule } from './participants/participants.module';
import { TrainingReleasesModule } from './training-releases/training-releases.module';

@Module({
  providers: [AppService],
  controllers: [AppController],
  imports: [
    UsersModule,
    BetDaysModule,
    TrainingBetModule,
    ParticipantsModule,
    TrainingReleasesModule,
    TypeOrmModule.forRoot({
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
      rootPath: join(__dirname, '..', 'public/imagesReleases'), // Caminho da pasta de uploads
    }),
    AuthModule,
  ],
})
export class AppModule {}
