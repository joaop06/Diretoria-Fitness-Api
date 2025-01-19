import { EmailService } from './email.service';
import { FindOptionsDto } from '../../dtos/find.dto';
import { Public } from '../../decorators/public.decorator';
import { Exception } from '../../interceptors/exception.filter';
import { Controller, Post, HttpCode, Query } from '@nestjs/common';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @HttpCode(200)
  @Post('resend-verification-code')
  async resendVerificationCode(@Query() { where: { userId } }: FindOptionsDto) {
    try {
      return await this.emailService.resendVerificationCode(+userId);
    } catch (e) {
      new Exception(e);
    }
  }
}
