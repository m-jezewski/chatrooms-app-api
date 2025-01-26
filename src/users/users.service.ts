import { ClassSerializerInterceptor, ConflictException, Injectable, UseInterceptors } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EmailInUseError } from '../utils/customExceptions';
import { getHashedPassword } from '../utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMany(params: Prisma.UserFindManyArgs): Promise<User[]> {
    const { skip, take, cursor, orderBy, where } = params;

    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      orderBy,
      where,
    });
  }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.findUnique({ where });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = getHashedPassword(data.password);
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });

    if (existingUser) {
      throw new EmailInUseError();
    }

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async updateUser(params: { data: Prisma.UserUpdateInput; where: Prisma.UserWhereUniqueInput }): Promise<User> {
    const { data, where } = params;

    return this.prisma.user.update({
      where,
      data: {
        ...data,
      },
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }
}
