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
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadTrainingFile } from './dto/upload-training-file.dto';

@Controller('training-releases')
export class TrainingReleasesController {
  constructor(
    private readonly trainingReleasesService: TrainingReleasesService,
  ) {}

  @Post()
  async create(
    @Body() object: CreateTrainingReleasesDto,
  ): Promise<TrainingReleasesEntity> {
    try {
      return await this.trainingReleasesService.create(object);
    } catch (e) {
      new Exception(`Falha ao inserir lançamento: ${e.message}`);
    }
  }

  @Post('photo/:id')
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
  async uploadTrainingPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() object: UploadTrainingFile,
  ) {
    try {
      object.imagePath = file.path;
      return await this.trainingReleasesService.uploadTrainingPhoto(
        +id,
        object,
      );
    } catch (e) {
      new Exception(`Falha ao inserir foto do treino: ${e.message}`);
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
