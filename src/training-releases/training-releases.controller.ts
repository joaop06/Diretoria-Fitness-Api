import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { Exception } from 'interceptors/exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { TrainingReleasesEntity } from './training-releases.entity';
import { TrainingReleasesService } from './training-releases.service';
import { CreateTrainingReleasesDto } from './dto/create-training-release.dto';
import {
  Get,
  Body,
  Post,
  Query,
  Param,
  Patch,
  Delete,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

@Controller('training-releases')
export class TrainingReleasesController {
  constructor(
    private readonly trainingReleasesService: TrainingReleasesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/imagesReleases',
        filename: (req, file, cb) => {
          const filename: string = uuidv4() + path.extname(file.originalname);
          cb(null, filename);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() object: CreateTrainingReleasesDto,
  ): Promise<TrainingReleasesEntity> {
    try {
      object.imagePath = file.path;
      return await this.trainingReleasesService.create(object);
    } catch (e) {
      throw new Error(`Falha ao inserir lançamento: ${e.message}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() object: Partial<TrainingReleasesEntity>,
  ): Promise<any> {
    try {
      return await this.trainingReleasesService.update(+id, object);
    } catch (e) {
      throw new Error(`Falha ao atualizar lançamento: ${e.message}`);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    try {
      return await this.trainingReleasesService.delete(+id);
    } catch (e) {
      new Exception({
        ...e,
        message: `Falha ao deletar lançamento: ${e.message}`,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TrainingReleasesEntity> {
    try {
      return await this.trainingReleasesService.findOne(+id);
    } catch (e) {
      throw e;
    }
  }

  @Get()
  async findAll(
    @Query() options: FindOptionsDto<TrainingReleasesEntity>,
  ): Promise<FindReturnModelDto<TrainingReleasesEntity>> {
    try {
      return await this.trainingReleasesService.findAll(options);
    } catch (e) {
      new Exception(e);
    }
  }
}
