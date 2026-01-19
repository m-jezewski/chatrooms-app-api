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
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TextChannelsService } from './textChannels.service';
import { SessionGuard } from '../auth/guards/session-guard';
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

    return this.textChannelsService.findChannelsByUser({
      user,
      findParams: {},
    });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getTextChannelById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as User;

    return this.textChannelsService.getChannel({ channelId: id, user: user });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('create')
  async create(@Body() textChannel: CreateTextChannelDto) {
    return this.textChannelsService.createTextChannel({ textChannel });
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

    return this.textChannelsService.updateUsersInChannel({
      userIds: users,
      user: user,
      channelId: id,
    });
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

    return this.textChannelsService.updateTextChannel({
      channelId: id,
      textChannel: data,
      user,
    });
  }

  @UseGuards(SessionGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteTextChannel(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as User;

    return this.textChannelsService.deleteTextChannel({
      channelId: id,
      user: user,
    });
  }
}
