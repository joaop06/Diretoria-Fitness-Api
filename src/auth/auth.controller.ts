import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Public } from '../../public/decorators/public.decorator';
import { Exception } from '../../public/interceptors/exception.filter';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.authService.validateUser(loginDto);

      if (!user)
        throw new Exception({
          message: 'Credenciais inválidas',
          statusCode: 401,
        });

      return await this.authService.login(user);
    } catch (e) {
      new Exception(e);
    }
  }
}
