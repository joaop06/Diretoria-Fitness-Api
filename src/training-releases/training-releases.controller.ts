import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { FileDto } from '../../public/dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadTrainingFileDto } from './dto/upload-training-file.dto';
import { TrainingReleasesService } from './training-releases.service';
import { Exception } from '../../public/interceptors/exception.filter';
import { TrainingReleasesEntity } from './entities/training-releases.entity';
import { CreateTrainingReleasesDto } from './dto/create-training-release.dto';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';
import {
  Get,
  Body,
  Post,
  Query,
  Param,
  Controller,
  UploadedFile,
  UseInterceptors,
  Delete,
} from '@nestjs/common';

const uploadDir = path.join(__dirname, '../../public/imagesReleases');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
        destination: uploadDir,
        filename: (req, file, cb) => {
          const filename: string = uuidv4() + path.extname(file.originalname);
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadTrainingPhoto(
    @UploadedFile() file: FileDto,
    @Param('id') id: string,
    @Body() object: UploadTrainingFileDto,
  ) {
    try {
      object.imagePath = file?.path;
      if (!object.imagePath) throw new Error('Imagem não informada');

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
      new Exception(e);
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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.trainingReleasesService.delete(+id);
    } catch (e) {
      new Exception(e);
    }
  }
}
