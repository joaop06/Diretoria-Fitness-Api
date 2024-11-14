import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UsersEntity } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) { }

  async create(object: CreateUserDto): Promise<UsersEntity> {
    try {
      const newUser = this.usersRepository.create(object);
      return await this.usersRepository.save(newUser);
    } catch (e) {
      throw e;
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
