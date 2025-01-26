import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesGateway } from './MessagesGateway';

@Module({
  imports: [PrismaModule],
  providers: [MessagesGateway],
  exports: [MessagesGateway],
})
export class MessagesModule {}
