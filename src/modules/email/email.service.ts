import { join } from 'path';
import { existsSync } from 'fs';
import * as moment from 'moment';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { LevelEnum } from '../system-logs/enum/log-level.enum';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { UsersEntity } from '../users/entities/users.entity';

@Injectable()
export class EmailService {
  private pathLogo = join(
    __dirname,
    '..',
    '..',
    'public',
    'widgets',
    'logo-diretoria-fitness.jpg',
  );

  private sourceSystemLog = 'email.service';

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly systemLogsService: SystemLogsService,
  ) {
    if (!existsSync(this.pathLogo)) throw new Error('Logo não encontrado');
  }

  private async upsertSystemLogs(level: LevelEnum, message: string) {
    return await this.systemLogsService.upsert({
      level,
      message,
      source: this.sourceSystemLog,
    });
  }

  private async sendMail(
    email: string,
    context: object,
    template: string,
    subject: string,
    attachments: Array<any> = [],
  ) {
    return await this.mailerService.sendMail({
      context,
      subject,
      template,
      to: email,
      attachments,
    });
  }

  async sendVerificationCode(name: string, email: string, code: number) {
    try {
      const context = { code, name };
      const template = 'email-verification-code';
      const subject = 'Código de Verificação de E-mail';
      const attachments = [
        {
          path: this.pathLogo,
          cid: 'logoDiretoriaFitness',
          filename: 'logo-diretoria-fitness.jpg',
        },
      ];

      const result = await this.sendMail(
        email,
        context,
        template,
        subject,
        attachments,
      );

      this.upsertSystemLogs(
        LevelEnum.INFO,
        `Código de Verificação ${email}: ${code}`,
      );

      return result;
    } catch (e) {
      const message = `Falha ao enviar Código de Verificação para ${email}`;

      this.upsertSystemLogs(LevelEnum.ERROR, `${message}: ${e.message}`);

      throw { ...e, message };
    }
  }

  async resendVerificationCode(userId: number) {
    try {
      const user = (await this.usersService.findOne(userId)) as UsersEntity;
      if (!user) throw new Error('Usuário não encontrado');

      if (user.isVerified) throw new Error('E-mail já verificado');

      const today = moment();
      const verificationCodeExpiration = moment(user.verificationCodeAt).add(
        1,
        'minutes',
      );

      // Verifica se ainda não passaram 5 minutos
      if (
        user.verificationCodeAt !== null &&
        today.isBefore(verificationCodeExpiration)
      ) {
        const remainingTime = verificationCodeExpiration.diff(today, 'seconds');
        throw new Error(
          `Aguarde ${remainingTime} segundos para solicitar novamente`,
        );
      }

      // Gera e atualiza usuário com novo Código de Verificação
      const code = await this.usersService.generateVerificationCode(userId);

      this.sendVerificationCode(user.name, user.email, code);

      return { message: 'Código de verificação reenviado!' };
    } catch (e) {
      throw e;
    }
  }
}
