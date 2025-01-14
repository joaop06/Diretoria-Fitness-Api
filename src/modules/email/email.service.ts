import { join } from 'path';
import { existsSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LevelEnum } from '../system-logs/enum/log-level.enum';
import { SystemLogsService } from '../system-logs/system-logs.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly systemLogsService: SystemLogsService,
  ) {}

  async sendVerificationCode(name: string, email: string, code: number) {
    try {
      const path = join(
        __dirname,
        '..',
        '..',
        'public',
        'widgets',
        'logo-diretoria-fitness.jpg',
      );

      if (!existsSync(path)) throw new Error('Logo não encontrado');

      await this.mailerService.sendMail({
        to: email,
        context: { code, name },
        template: 'email-verification-code',
        subject: 'Código de Verificação de E-mail',
        attachments: [
          {
            path,
            cid: 'logoDiretoriaFitness',
            filename: 'logo-diretoria-fitness.jpg',
          },
        ],
      });

      await this.systemLogsService.upsert({
        level: LevelEnum.INFO,
        source: 'email.service',
        message: `Código de Verificação ${email}: ${code}`,
      });
    } catch (e) {
      await this.systemLogsService.upsert({
        level: LevelEnum.ERROR,
        source: 'email.service',
        message: `Falha na verificação de ${email}: ${e.message}`,
      });

      throw {
        ...e,
        message: `Falha ao enviar código de verificação para ${email}`,
      };
    }
  }
}
