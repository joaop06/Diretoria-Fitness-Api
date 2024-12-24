import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode(name: string, email: string, code: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Código de Verificação de E-mail',
      template: 'email-verification-code',
      context: { code, name },
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
          ), // Caminho local
        },
      ],
    });
  }
}
