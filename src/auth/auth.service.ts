import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { readFiles } from '../../helper/read.files';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../users/entities/users.entity';
import { UserVerificationCodeDto } from './dto/user-verification-code.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(object: LoginDto) {
    const { email, password } = object;
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password;
      return user;
    }

    return null;
  }

  async login(user: UsersEntity) {
    const payload = { email: user.email, sub: user.id };

    // Leitura da foto de perfil
    const userResult = plainToClass(UsersEntity, user);
    userResult.profileImagePath = readFiles(userResult.profileImagePath);

    return {
      user: userResult,
      message: 'Login realizado com sucesso!',
      accessToken: this.jwtService.sign(payload),
    };
  }

  async verifyUserVerificationCode(
    object: UserVerificationCodeDto,
  ): Promise<string> {
    const user = await this.usersService.findOne(object.userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.isVerified) throw new Error();

    // Verifica se o código é válido e não expirou
    const isCodeValid = user.verificationCode === object.code;

    if (!isCodeValid)
      throw new Error('Código de Verificação inválido ou expirado');

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationCode: null,
    });
    return 'E-mail verificado com sucesso!';
  }
}
