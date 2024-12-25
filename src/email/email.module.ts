import { join } from 'path';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { SystemLogsModule } from '../system-logs/system-logs.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    SystemLogsModule,
    MailerModule.forRoot({
      transport: {
        port: 587,
        secure: false,
        host: 'smtp.gmail.com',
        auth: {
          pass: 'bgtz llkk kwzt vukh',
          user: 'diretoria.fitness2020@gmail.com',
        },
      },
      defaults: {
        from: 'Diretoria Fitness <diretoria.fitness2020@gmail.com>',
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
