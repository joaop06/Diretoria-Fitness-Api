import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
import { UsersEntity } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../public/decorators/public.decorator';
import { Exception } from '../../public/interceptors/exception.filter';
import { Body, Controller, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Public()
  async create(@Body() object: CreateUserDto): Promise<UsersEntity> {
    try {
      const user = await this.usersService.create(object);

      return plainToClass(UsersEntity, user);
    } catch (e) {
      new Exception(e);
    }
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() object: UpdateUserDto,
  ): Promise<any> {
    try {
      if (req.user.id !== +id) throw new Error('Não é possível alterar dados de outro usuário');

      return await this.usersService.update(+id, object);
    } catch (e) {
      new Exception(e);
    }
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string): Promise<UsersEntity> {
    try {
      if (req.user.id !== +id) throw new Error('Não é possível buscar dados de outro usuário');

      const user = await this.usersService.findOne(+id);

      return plainToClass(UsersEntity, user);
    } catch (e) {
      new Exception(e);
    }
  }

  @Put('change-password')
  async changePassword(@Body() object: ChangePasswordDto): Promise<any> {
    try {
      await this.usersService.changePassword(object);
      return { message: 'Sucesso ao atualizar senha' };
    } catch (e) {
      const message = `Erro ao atualizar senha: ${e.message}`;
      new Exception({ ...e, message });
    }
  }
}
