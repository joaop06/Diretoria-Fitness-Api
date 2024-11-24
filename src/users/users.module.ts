import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersEntity } from './entities/users.entity';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([UsersEntity]), RankingModule],
})
export class UsersModule {}
