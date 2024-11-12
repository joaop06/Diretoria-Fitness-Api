import { Module } from '@nestjs/common';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';

@Module({
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([UsersEntity])],
})
export class UsersModule { }
