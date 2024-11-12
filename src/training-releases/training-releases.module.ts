import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingReleasesEntity } from './training-releases.entity';
import { TrainingReleasesService } from './training-releases.service';
import { TrainingReleasesController } from './training-releases.controller';

@Module({
  exports: [TrainingReleasesService],
  providers: [TrainingReleasesService],
  controllers: [TrainingReleasesController],
  imports: [TypeOrmModule.forFeature([TrainingReleasesEntity])],
})
export class TrainingReleasesModule {}