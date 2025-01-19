import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import MessagesController from './messages/messages.controller';
import { MessagesService } from './messages/messages.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, MessagesController],
  providers: [AppService, PrismaService, MessagesService],
})
export class AppModule {}
