import { Module } from '@nestjs/common';
import { TextChannelsController } from './textChannels.controller';
import { TextChannelsService } from './textChannels.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TextChannelsController],
  providers: [TextChannelsService],
})
export class TextChannelsModule {}
