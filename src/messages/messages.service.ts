import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async messages(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MessageWhereUniqueInput;
    where?: Prisma.MessageWhereInput;
    orderBy?: Prisma.MessageOrderByWithRelationInput;
  }): Promise<Message[]> {
    const { skip, take, cursor, orderBy, where } = params;

    return this.prisma.message.findMany({
      skip,
      take,
      cursor,
      orderBy,
      where,
    });
  }

  async message(messageWhereUniqueInput: Prisma.MessageWhereUniqueInput): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: messageWhereUniqueInput,
    });
  }

  async createMessage(data: Prisma.MessageCreateInput) {
    return this.prisma.message.create({ data });
  }

  async updateMessage(params: {
    where: Prisma.MessageWhereUniqueInput;
    data: Prisma.MessageUpdateInput;
  }): Promise<Message> {
    const { where, data } = params;
    return this.prisma.message.update({
      data,
      where,
    });
  }

  async deleteMessage(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
    return this.prisma.message.delete({
      where,
    });
  }
}
