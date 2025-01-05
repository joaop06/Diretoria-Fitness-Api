import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { isArray } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { readFiles } from '../../helper/read.files';
import { EmailService } from '../email/email.service';
import { FindManyOptions, Repository } from 'typeorm';
import { UsersEntity } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReturnedUserDto } from './dto/returned-user.dto';
import { RankingService } from '../ranking/ranking.service';
import { BetDaysService } from '../bet-days/bet-days.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Exception } from '../../interceptors/exception.filter';
import { UsersLogsService } from '../users-logs/users-logs.service';
import { UploadProfileImageDto } from './dto/upload-profile-image.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { FindOptionsDto, FindReturnModelDto } from '../../dtos/find.dto';
import { ParticipantsService } from '../participants/participants.service';
import { TrainingBetsService } from '../training-bets/training-bets.service';
import { LevelEnum as LogLevelEnum } from '../system-logs/enum/log-level.enum';

@Injectable()
export class UsersService {
  private logger = new Logger();

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    private readonly emailService: EmailService,

    private readonly betDaysService: BetDaysService,

    private readonly rankingService: RankingService,

    private readonly usersLogsService: UsersLogsService,

    private readonly systemLogsService: SystemLogsService,

    private readonly trainingBetsService: TrainingBetsService,

    @Inject(forwardRef(() => ParticipantsService))
    private readonly participantsService: ParticipantsService,
  ) { }

  async saveAndSendVerificationCode(
    userId: number,
    name: string,
    email: string,
  ): Promise<void> {
    const verificationCode = Math.floor(Math.random() * 1000000);

    // Atualize o usuário com o código de verificação
    await this.usersRepository.update(userId, { verificationCode });

    // Enviar e-mail de verificação
    this.emailService.sendVerificationCode(name, email, verificationCode);
  }

  async create(
    object: CreateUserDto,
  ): Promise<{ message: string; user: UsersEntity }> {
    try {
      // Irá calcular o IMC e atribuir ao objeto do novo usuário
      await this.validateUserChangeLogs(object);

      const password = await bcrypt.hash(object.password, 10);

      const newUser = this.usersRepository.create({ ...object, password });
      const user = await this.usersRepository.save(newUser);

      // Insere registro do usuário para classificação
      await this.rankingService.create(user.id);

      // Salvar e Enviar o código de verificação
      await this.saveAndSendVerificationCode(user.id, user.name, object.email);

      return {
        user,
        message:
          'Usuário cadastrado com sucesso! Código de verificação enviado no e-mail',
      };
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

  async findOne(id: number): Promise<ReturnedUserDto | UsersEntity> {
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

      // Leitura da Foto de Perfil
      user.profileImagePath = readFiles(user.profileImagePath);

      return {
        ...user,
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

    const passwordMatch = await bcrypt.compare(
      object.oldPassword,
      user.password,
    );
    if (!passwordMatch) throw new Error('Senha antiga inválida');

    return await this.usersRepository.update(userId, {
      password: await bcrypt.hash(object.newPassword, 10),
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

  async updateUserStatistics(usersId: number | number[]) {
    try {
      const updateUser = async (userId: number) => {
        try {
          const { wins, losses } =
            await this.trainingBetsService.validateUserLossesAndWins(userId);

          const totalTrainingDays =
            await this.betDaysService.getTotalTrainingDays(userId);
          const totalFaults =
            await this.participantsService.getTotalFaultsFromUser(userId);
          const totalParticipations =
            await this.participantsService.getTotalParticipations(userId);

          await this.usersRepository.update(userId, {
            wins,
            losses,
            totalFaults,
            totalTrainingDays,
            totalParticipations,
          });
        } catch (e) {
          const message = `Falha ao atualizar estatísticas do usuário ${userId}`;
          this.logger.error(`${message}: ${e.message}`);

          await this.systemLogsService.upsert({
            message,
            level: LogLevelEnum.ERROR,
            source: 'TrainingBetsService.updateStatisticsBets',
          });
        }
      };

      usersId = isArray(usersId) ? usersId : [usersId];
      await Promise.all(usersId.map((userId) => updateUser(userId)));
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
