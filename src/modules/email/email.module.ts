import { join } from 'path';
import { config } from 'dotenv';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { UsersModule } from '../users/users.module';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { SystemLogsModule } from '../system-logs/system-logs.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

config();
const configService = new ConfigService();

@Module({
  imports: [
    forwardRef(() => UsersModule),
    SystemLogsModule,
    MailerModule.forRoot({
      transport: {
        timeout: 5000,
        host: configService.get('EMAIL_HOST'),
        port: +configService.get('EMAIL_PORT'),
        secure: configService.get('EMAIL_SECURE') === 'true',
        auth: {
          pass: configService.get('EMAIL_PASS'),
          user: configService.get('EMAIL_USER'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: `Diretoria Fitness <${configService.get('EMAIL_USER')}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  exports: [EmailService],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
