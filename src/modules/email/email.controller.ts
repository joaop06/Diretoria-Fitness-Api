import { EmailService } from './email.service';
import { Public } from '../../decorators/public.decorator';
import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { OnlyHomolog } from '../../decorators/only-homolog.decorator';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Public()
  @OnlyHomolog()
  @HttpCode(200)
  @Post('verification-code')
  async sendVerificationCode(
    @Body() object: SendVerificationCodeDto,
  ): Promise<string> {
    this.emailService.sendVerificationCode(
      object.name,
      object.email,
      object.code,
    );

    return 'E-mail enviado com sucesso!';
  }
}
