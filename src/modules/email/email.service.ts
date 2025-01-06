import { join } from 'path';
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
      await this.mailerService.sendMail({
        to: email,
        context: { code, name },
        template: 'email-verification-code',
        subject: 'Código de Verificação de E-mail',
        attachments: [
          {
            cid: 'logoDiretoriaFitness',
            filename: 'logo-diretoria-fitness.jpg',
            path: join(
              __dirname,
              '..',
              '..',
              'public',
              'widgets',
              'logo-diretoria-fitness.jpg',
            ),
          },
        ],
      });
    } catch (e) {
      await this.systemLogsService.upsert({
        level: LevelEnum.ERROR,
        message: `Falha na verificação de ${email}: ${e.message}`,
      });
    }
  }
}
