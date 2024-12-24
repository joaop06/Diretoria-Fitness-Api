import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode(email: string, code: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Código de Verificação de E-mail',
      template: 'email-verification-code',
      context: { code },
    });
  }
}
