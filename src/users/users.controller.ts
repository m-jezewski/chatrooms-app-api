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
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, RegisterUserDto, UpdateUserDto, UserEntity } from './dto/user-crud.dto';
import { EmailInUseError } from '../utils/customExceptions';
import { SessionGuard } from '../auth/guards/session-guard';
import { Request } from 'express';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAllUsers(): Promise<UserEntity[]> {
    const users = await this.usersService.findMany({});
    if (!Array.isArray(users)) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return users.map((u) => new UserEntity(u));
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return new UserEntity(user);
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('create')
  async create(@Body() user: CreateUserDto, @Req() request: Request) {
    const loggedUser = request.user as User;
    if (loggedUser.role !== 'ADMIN') {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const userDb = await this.usersService.createUser(user);
      return new UserEntity(userDb);
    } catch (error) {
      if (error instanceof EmailInUseError) {
        throw new ConflictException(error.message);
      }
    }
  }

  @UseGuards(SessionGuard)
  @Patch(':id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto) {
    return this.usersService.updateUser({ where: { id }, data });
  }
  @UseGuards(SessionGuard)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser({ id });
  }
}
