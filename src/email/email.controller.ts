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
  ): Promise<any> {
    return await this.emailService.sendVerificationCode(
      object.email,
      object.code,
    );
  }
}
