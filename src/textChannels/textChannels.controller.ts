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
import { ApiTags } from '@nestjs/swagger';
import { TextChannelsService } from './textChannels.service';
import { SessionGuard } from '../auth/guards/session-guard';
import { ChannelWithProvidedNameExistError } from '../utils/customExceptions';
import { TextChannel, User } from '@prisma/client';
import { CreateTextChannelDto, UpdateChannelUsersDto, UpdateTextChannelDto } from './dto/textChannels-crud.dto';
import { Request } from 'express';

@ApiTags('Text Channels')
@Controller('textChannels')
export class TextChannelsController {
  constructor(private readonly textChannelsService: TextChannelsService) {}

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
  async getTextChannelById(@Param('id', ParseIntPipe) id: number) {
    const textChannel = await this.textChannelsService.findOne({ id });
    if (!textChannel) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
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
  async updateChannelUsers(@Param('id', ParseIntPipe) id: number, @Body() { users }: UpdateChannelUsersDto) {
    return this.textChannelsService.updateUsersInChannel({ channelId: id, userIds: users });
  }

  @UseGuards(SessionGuard)
  @Put(':id')
  async updateTextChannel(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateTextChannelDto) {
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
  @Delete(':id')
  async deleteTextChannel(@Param('id', ParseIntPipe) id: number) {
    return this.textChannelsService.deleteTextChannel({ id });
  }
}
