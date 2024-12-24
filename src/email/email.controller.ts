import { EmailService } from './email.service';
import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { Public } from '../../public/decorators/public.decorator';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { OnlyHomolog } from '../../public/decorators/only-homolog.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

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
