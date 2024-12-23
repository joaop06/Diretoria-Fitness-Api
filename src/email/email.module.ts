import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'diretoria.fitness2020@gmail.com',
                    pass: 'bgtz llkk kwzt vukh'
                }
            },
            defaults: {
                from: 'Diretoria Fitness <diretoria.fitness2020@gmail.com>'
            }
        })
    ],
    exports: [EmailService],
    providers: [EmailService],
})
export class EmailModule { }
