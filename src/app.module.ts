import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';

import { UsersModule } from './users/users.module';
import { TrainingBetModule } from './training-bet/training-bet.module';
import { ParticipantsModule } from './participants/participants.module';
import { BetDaysController } from './bet-days/bet-days.controller';
import { BetDaysModule } from './bet-days/bet-days.module';
import { TrainingReleasesModule } from './training-releases/training-releases.module';

@Module({
  imports: [
    UsersModule,
    TrainingBetModule,
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
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ParticipantsModule,
    BetDaysModule,
    TrainingReleasesModule,
  ],
  controllers: [AppController, BetDaysController],
  providers: [AppService],
})
export class AppModule {}
