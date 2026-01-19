import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TextChannel, User } from '@prisma/client';
import { ChannelWithProvidedNameExistError } from '../utils/customExceptions';
import { CreateTextChannelDto, UpdateTextChannelDto } from './dto/textChannels-crud.dto';

export type TextChannelWithUsers = TextChannel & {
  users: { id: number }[];
};

@Injectable()
export class TextChannelsService {
  constructor(private prisma: PrismaService) {}

  private canAccessChannel(channel: TextChannelWithUsers, user: User): boolean {
    return user.role === 'ADMIN' || channel.users.some((channelUser) => channelUser.id === user.id);
  }

  async findChannelsByUser(params: { findParams: Prisma.TextChannelFindManyArgs; user: User }): Promise<TextChannel[]> {
    const { findParams, user } = params;

    if (user.role === 'ADMIN') {
      return this.prisma.textChannel.findMany(findParams);
    }

    return this.prisma.textChannel.findMany({
      ...findParams,
      where: {
        ...findParams.where,
        users: {
          some: {
            id: user.id,
          },
        },
      },
    });
  }

  async getChannel(params: { channelId: number; user: User }): Promise<TextChannelWithUsers> {
    const { channelId, user } = params;
    const channel = await this.prisma.textChannel.findUnique({
      where: { id: channelId },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (!this.canAccessChannel(channel, user)) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return channel;
  }

  async createTextChannel(params: { textChannel: CreateTextChannelDto }): Promise<TextChannel> {
    const { textChannel } = params;

    try {
      return await this.prisma.textChannel.create({
        data: {
          ...textChannel,
          users: {
            connect: textChannel.users.map((userId) => ({ id: userId })),
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ChannelWithProvidedNameExistError();
      }
      throw error;
    }
  }

  async updateTextChannel(params: {
    channelId: number;
    user: User;
    textChannel: UpdateTextChannelDto;
  }): Promise<TextChannel> {
    const { textChannel, channelId, user } = params;
    await this.getChannel({ channelId, user });

    try {
      return await this.prisma.textChannel.update({
        where: { id: channelId },
        data: {
          ...textChannel,
          users: textChannel.users ? { set: textChannel.users.map((userId) => ({ id: userId })) } : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ChannelWithProvidedNameExistError();
      }
      throw error;
    }
  }

  async deleteTextChannel(params: { channelId: number; user: User }): Promise<TextChannel> {
    const { channelId, user } = params;
    await this.getChannel({ channelId, user });
    return this.prisma.textChannel.delete({ where: { id: channelId } });
  }

  async updateUsersInChannel(params: { userIds: number[]; channelId: number; user: User }) {
    const { userIds, channelId, user } = params;
    await this.getChannel({ channelId, user });

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
