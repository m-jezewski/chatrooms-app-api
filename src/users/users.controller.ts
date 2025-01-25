import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, RegisterUserDto, UpdateUserDto, UserEntity } from './dto/user-crud.dto';
import { EmailInUseError } from '../utils/customExceptions';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAllUsers(): Promise<UserEntity[]> {
    const users = await this.usersService.findMany({});
    if (!Array.isArray(users)) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return users.map((u) => new UserEntity(u));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return new UserEntity(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('create')
  async create(@Body() user: CreateUserDto) {
    try {
      const userDb = await this.usersService.createUser(user);
      return new UserEntity(userDb);
    } catch (error) {
      if (error instanceof EmailInUseError) {
        throw new ConflictException(error.message);
      }
    }
  }

  @Put(':id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto) {
    return this.usersService.updateUser({ where: { id }, data });
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser({ id });
  }
}
