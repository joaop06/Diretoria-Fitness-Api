import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { readFiles } from '../../helper/read.files';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../users/entities/users.entity';

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
}
