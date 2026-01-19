import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { getHashedPassword } from '../utils/bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto/user-crud.dto';
import { EmailInUseError } from '../utils/customExceptions';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private canModifyUser(targetUserId: number, loggedUser: User): boolean {
    return loggedUser.role === 'ADMIN' || loggedUser.id === targetUserId;
  }

  async findUsers(params: { findParams: Prisma.UserFindManyArgs }): Promise<User[]> {
    return this.prisma.user.findMany(params.findParams);
  }

  async getUser(params: { userId: number }): Promise<User> {
    const { userId } = params;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByEmail(params: { email: string }): Promise<User> {
    const { email } = params;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(params: CreateUserDto): Promise<User> {
    const { role, password, name, email } = params;

    try {
      return await this.prisma.user.create({
        data: {
          name: name,
          role: role,
          email: email,
          password: getHashedPassword(password),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailInUseError();
      }
      throw error;
    }
  }

  async updateUser(params: { userId: number; loggedUser: User; data: UpdateUserDto }): Promise<User> {
    const { userId, loggedUser, data } = params;
    await this.getUser({ userId });

    if (!this.canModifyUser(userId, loggedUser)) {
      throw new ForbiddenException('You can only update your own account');
    }

    if (data.role && loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change user roles');
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailInUseError();
      }
      throw error;
    }
  }

  async deleteUser(params: { userId: number; loggedUser: User }): Promise<User> {
    const { userId, loggedUser } = params;
    await this.getUser({ userId });

    if (!this.canModifyUser(userId, loggedUser)) {
      throw new ForbiddenException('You can only delete your own account');
    }

    return this.prisma.user.delete({ where: { id: userId } });
  }
}
