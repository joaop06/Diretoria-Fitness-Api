import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFiles } from '../../helper/read.files';
import { FindManyOptions, Repository } from 'typeorm';
import { UsersEntity } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReturnedUserDto } from './dto/returned-user.dto';
import { RankingService } from '../ranking/ranking.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersLogsService } from '../users-logs/users-logs.service';
import { Exception } from '../../public/interceptors/exception.filter';
import { UploadProfileImageDto } from './dto/upload-profile-image.dto';
import { UpdateStatisticsUserDto } from './dto/update-statistics-user.dto';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';
import { ParticipantsEntity } from '../participants/entities/participants.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    @InjectRepository(ParticipantsEntity)
    private participantsRepository: Repository<ParticipantsEntity>,

    private rankingService: RankingService,

    private usersLogsService: UsersLogsService,
  ) { }

  async create(object: CreateUserDto): Promise<UsersEntity> {
    try {
      // Irá calcular o IMC e atribuir ao objeto do novo usuário
      await this.validateUserChangeLogs(object);

      const password = await bcrypt.hash(object.password, 10);

      const newUser = this.usersRepository.create({ ...object, password });
      const result = await this.usersRepository.save(newUser);

      // Insere registro do usuário para classificação
      await this.rankingService.create(result.id);

      return result;
    } catch (e) {
      if (e.message.includes('Duplicate entry')) {
        new Exception({
          message: 'Este email já está em uso',
          statusCode: 409,
        });
      } else {
        throw e;
      }
    }
  }

  async update(id: number, object: UpdateUserDto) {
    try {
      /**
       * Validação dos dados que serão alterados
       */
      const { userLogsPromises } = await this.validateUserChangeLogs(
        object,
        id,
      );

      /** Usuário atualizado */
      const result = await this.usersRepository.update(id, object);

      /** Insere os logs de alterações */
      await Promise.all(userLogsPromises);

      return result;
    } catch (e) {
      throw e;
    }
  }

  async validateUserChangeLogs(object: UpdateUserDto, userId?: number) {
    try {
      let userLogsPromises = [];
      if (object.weight || object.height) {
        // Calcula o IMC com 2 casas decimais
        object.bmi = this.calculateBMI(object.weight, object.height);

        // Somente insere logs na atualização do usuário
        if (userId) {
          /** Dados do Usuário antes de atualizar */
          const oldDataUser = await this.usersRepository.findOne({
            where: { id: userId },
          });

          /**
           * Calcula novamente o IMC
           * caso tenha atualizado apenas um dos parêmetros
           */
          if (!object.bmi) {
            object.weight = object.weight ?? +oldDataUser.weight;
            object.height = object.height ?? +oldDataUser.height;
            object.bmi = this.calculateBMI(object.weight, object.height);
          }

          const keys = Object.keys(object);
          userLogsPromises = keys.map((fieldName) => {
            if (
              ['weight', 'height', 'bmi'].includes(fieldName) &&
              parseFloat(oldDataUser[fieldName]) !== object[fieldName]
            ) {
              const value = `${object[fieldName]}`;
              return this.usersLogsService.create({ value, userId, fieldName });
            }
          });
        }
      }

      return { userLogsPromises };
    } catch (e) {
      throw e;
    }
  }

  private calculateBMI(weight: number, height: number): number {
    const bmi = parseFloat((weight / (height * height)).toFixed(2));

    return isNaN(bmi) ? 0 : bmi;
  }

  async updateStatistics(id: number, object: UpdateStatisticsUserDto) {
    try {
      return await this.usersRepository.update(id, object);
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<ReturnedUserDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        relations: ['userLogs'],
      });

      const bmiLogs = user.userLogs.filter((log) => log.fieldName === 'bmi');
      const heightLogs = user.userLogs.filter(
        (log) => log.fieldName === 'height',
      );
      const weightLogs = user.userLogs.filter(
        (log) => log.fieldName === 'weight',
      );

      // Total de apostas participadas
      const betsParticipated = await this.participantsRepository.count({
        where: { user: { id } },
      });

      // Leitura da Foto de Perfil
      user.profileImagePath = readFiles(user.profileImagePath);

      return {
        ...user,
        betsParticipated,
        userLogs: {
          bmiLogs,
          heightLogs,
          weightLogs,
        },
      };
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<UsersEntity> | FindManyOptions<UsersEntity>,
  ): Promise<FindReturnModelDto<UsersEntity>> {
    const [rows, count] = await this.usersRepository.findAndCount(options);
    return { rows, count };
  }

  async findOneByEmail(email: string): Promise<UsersEntity> {
    return await this.usersRepository.findOneBy({ email });
  }

  async changePassword(object: ChangePasswordDto): Promise<any> {
    const { userId } = object;
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new Error('Usuário não encontrado');

    const passwordMatch = object.oldPassword === user.password;
    if (!passwordMatch) throw new Error('Senha antiga inválida');

    return await this.usersRepository.update(userId, {
      password: object.newPassword,
    });
  }

  async uploadProfileImage(id: number, object: UploadProfileImageDto) {
    try {
      const { profileImagePath } = object;

      const user = await this.usersRepository.findOne({
        where: { id },
      });
      if (!user) throw new Error('Usuário não encontrado');

      return await this.usersRepository.update(id, { profileImagePath });
    } catch (e) {
      fs.unlink(object.profileImagePath, () => { });
      throw e;
    }
  }
}
