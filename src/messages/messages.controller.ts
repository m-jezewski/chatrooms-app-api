import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from '@prisma/client';

@Controller('messages')
export default class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getAllMessages() {
    return this.messagesService.messages({});
  }

  @Get(':id')
  getMessageById(@Param('id') id: string) {
    return this.messagesService.message({ id: Number(id) });
  }

  @Post()
  async createMessage(@Body() message: Message) {
    return this.messagesService.createMessage(message);
  }

  @Put(':id')
  async replaceMessage(@Param('id') id: string, @Body() data: Message) {
    return this.messagesService.updateMessage({ where: { id: Number(id) }, data });
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    return this.messagesService.deleteMessage({ id: Number(id) });
  }
}
