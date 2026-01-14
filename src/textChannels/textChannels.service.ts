import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TextChannel, User } from '@prisma/client';
import { ChannelWithProvidedNameExistError } from '../utils/customExceptions';

export type TextChannelWithUsers = TextChannel & {
  users: { id: number }[];
};

@Injectable()
export class TextChannelsService {
  constructor(private prisma: PrismaService) {}

  async findChannelsByUser(params: Prisma.TextChannelFindManyArgs, user: User): Promise<TextChannel[]> {
    const { skip, take, cursor, orderBy, where } = params;

    if (user.role === 'ADMIN') {
      return this.prisma.textChannel.findMany(params);
    }

    return this.prisma.textChannel.findMany({
      skip,
      take,
      cursor,
      orderBy,
      where: {
        ...where,
        users: {
          some: {
            id: user.id,
          },
        },
      },
    });
  }

  async findOne(where: Prisma.TextChannelWhereUniqueInput): Promise<TextChannelWithUsers | null> {
    return this.prisma.textChannel.findUnique({
      where: where,
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async createTextChannel(data: Prisma.TextChannelCreateInput): Promise<TextChannel> {
    const existingChannel = await this.prisma.textChannel.findFirst({ where: { name: data.name } });

    if (existingChannel) {
      throw new ChannelWithProvidedNameExistError();
    }

    return this.prisma.textChannel.create({ data });
  }

  async updateTextChannel(params: {
    data: Prisma.TextChannelUpdateInput;
    where: Prisma.TextChannelWhereUniqueInput;
  }): Promise<TextChannel> {
    const { data, where } = params;

    return this.prisma.textChannel.update({
      where,
      data: data,
    });
  }

  async deleteTextChannel(where: Prisma.TextChannelWhereUniqueInput): Promise<TextChannel> {
    return this.prisma.textChannel.delete({ where });
  }

  async updateUsersInChannel({ userIds, channelId }: { userIds: number[]; channelId: number }) {
    await this.prisma.textChannel.update({
      where: { id: channelId },
      data: {
        users: {
          connect: userIds.map((userId) => ({ id: userId })),
        },
      },
    });
  }
}
