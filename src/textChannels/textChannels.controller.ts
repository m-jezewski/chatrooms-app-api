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
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TextChannelsService, TextChannelWithUsers } from './textChannels.service';
import { SessionGuard } from '../auth/guards/session-guard';
import { ChannelWithProvidedNameExistError } from '../utils/customExceptions';
import { TextChannel, User } from '@prisma/client';
import { CreateTextChannelDto, UpdateChannelUsersDto, UpdateTextChannelDto } from './dto/textChannels-crud.dto';
import { Request } from 'express';

@ApiTags('Text Channels')
@Controller('textChannels')
export class TextChannelsController {
  constructor(private readonly textChannelsService: TextChannelsService) {}

  private isChannelMember(channel: TextChannelWithUsers, userId: number): boolean {
    return channel.users.some((u) => u.id === userId);
  }

  private canAccessChannel(channel: TextChannelWithUsers, user: User): boolean {
    return user.role === 'ADMIN' || this.isChannelMember(channel, user.id);
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAllTextChannels(@Req() req: Request): Promise<TextChannel[]> {
    const user = req.user as User;
    const chatrooms = await this.textChannelsService.findChannelsByUser({}, user);
    if (!Array.isArray(chatrooms)) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return chatrooms;
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getTextChannelById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as User;
    const textChannel = await this.textChannelsService.findOne({ id });

    if (!textChannel) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (!this.canAccessChannel(textChannel, user)) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return textChannel;
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('create')
  async create(@Body() textChannel: CreateTextChannelDto) {
    try {
      return await this.textChannelsService.createTextChannel({
        ...textChannel,
        users: {
          connect: textChannel.users.map((uId) => ({ id: uId })),
        },
      });
    } catch (error) {
      if (error instanceof ChannelWithProvidedNameExistError) {
        throw new ConflictException(error.message);
      }
    }
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async updateChannelUsers(
    @Param('id', ParseIntPipe) id: number,
    @Body() { users }: UpdateChannelUsersDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    const channel = await this.textChannelsService.findOne({ id });

    if (!channel) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (!this.canAccessChannel(channel, user)) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return this.textChannelsService.updateUsersInChannel({ channelId: id, userIds: users });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  async updateTextChannel(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTextChannelDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    const channel = await this.textChannelsService.findOne({ id });

    if (!channel) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (!this.canAccessChannel(channel, user)) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return this.textChannelsService.updateTextChannel({
      where: { id },
      data: {
        name: data.name,
        users: {
          set: data.users.map((uId) => ({ id: uId })),
        },
      },
    });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteTextChannel(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as User;
    const channel = await this.textChannelsService.findOne({ id });

    if (!channel) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (!this.canAccessChannel(channel, user)) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return this.textChannelsService.deleteTextChannel({ id });
  }
}
