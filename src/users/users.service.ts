import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Exception } from '../../public/interceptors/exception.filter';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(object: CreateUserDto): Promise<UsersEntity> {
    try {
      const password = await bcrypt.hash(object.password, 10);

      const newUser = this.usersRepository.create({ ...object, password });
      return await this.usersRepository.save(newUser);
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        e.message.includes('Duplicate entry')
      ) {
        // Duplicidade de email
        throw new Exception({
          message: 'Este email já está em uso',
          statusCode: 409,
        });
      } else {
        throw e;
      }
    }
  }

  async update(id: number, object: UpdateUserDto) {
    try {
      return await this.usersRepository.update(id, object);
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<UsersEntity> {
    try {
      return await this.usersRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async findOneByEmail(email: string): Promise<UsersEntity> {
    return await this.usersRepository.findOneBy({ email });
  }

  async changePassword(object: ChangePasswordDto): Promise<any> {
    const { userId } = object;
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new Error('Usuário não encontrado');

    const passwordMatch = object.oldPassword === user.password;
    if (!passwordMatch) throw new Error('Senha antiga inválida');

    return await this.usersRepository.update(userId, {
      password: object.newPassword,
    });
  }
}
