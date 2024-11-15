import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersEntity } from './entities/users.entity';

@Module({
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([UsersEntity])],
})
export class UsersModule {}
