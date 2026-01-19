import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
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
    const users = await this.usersService.findUsers({ findParams: {} });
    return users.map((u) => new UserEntity(u));
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const user = await this.usersService.getUser({ userId: id });
    return new UserEntity(user);
  }

  @UseGuards(SessionGuard, AdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('create')
  async create(@Body() user: CreateUserDto): Promise<UserEntity> {
    const created = await this.usersService.createUser(user);
    return new UserEntity(created);
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
    @Req() request: Request,
  ): Promise<UserEntity> {
    const loggedUser = request.user as User;
    const updated = await this.usersService.updateUser({ userId: id, loggedUser, data });
    return new UserEntity(updated);
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Req() request: Request): Promise<UserEntity> {
    const loggedUser = request.user as User;
    const deleted = await this.usersService.deleteUser({ userId: id, loggedUser });
    return new UserEntity(deleted);
  }
}
