import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserEntity } from './dto/user-crud.dto';
import { EmailInUseError } from '../utils/customExceptions';
import { SessionGuard } from '../auth/guards/session-guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

@ApiTags('Users')
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

  @UseGuards(SessionGuard, AdminGuard)
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
      throw error;
    }
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto, @Req() request: Request) {
    const loggedUser = request.user as User;

    if (loggedUser.id !== id && loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own account');
    }

    if (data.role && loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change user roles');
    }

    const updated = await this.usersService.updateUser({ where: { id }, data });
    return new UserEntity(updated);
  }
  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const loggedUser = request.user as User;

    if (loggedUser.id !== id && loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own account');
    }

    const deleted = await this.usersService.deleteUser({ id });
    return new UserEntity(deleted);
  }
}
