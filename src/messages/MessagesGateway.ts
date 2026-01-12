import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { WsSessionGuard } from '../auth/guards/ws-session-guard';
import { UseGuards } from '@nestjs/common';
import { CurrentWsUser } from './current-ws-user.decorator';

@WebSocketGateway(parseInt(process.env.WEBSOCKET_PORT), {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  cookie: true,
})
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly prisma: PrismaService) {}

  async afterInit(server: Server) {
    console.log('✅ WebSocket Gateway initialized on port 3001');

    server.on('connection', (socket) => {
      const handshake = socket?.handshake as any;
      const session = handshake.session;

      if (!session?.passport?.user) {
        console.warn('❌ Unauthorized WebSocket connection attempt');
        socket.disconnect(true);
        return;
      }
      console.log(`✅ User ${session.passport.user} connected`);
    });

    server.on('connect_error', (err) => {
      console.error(`❌ WebSocket connection error: ${err.message}`);
    });
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() { channelId }: { channelId: number },
    @ConnectedSocket() client: Socket,
    @CurrentWsUser() userId: number,
  ) {
    console.log(`User ${userId} is joining channel ${channelId}`);
    const channel = await this.prisma.textChannel.findUnique({
      where: { id: channelId },
      include: { users: true },
    });

    const recentMessages = await this.prisma.message.findMany({
      where: { textChannelId: channelId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!channel) {
      console.warn(`Channel ${channelId} not found`);
      return client.emit('error', { message: 'Channel not found' });
    }

    const isMember = channel.users.some((user) => user.id === userId);
    if (!isMember) {
      return client.emit('error', { message: 'You are not a member of this channel' });
    }

    client.join(`channel_${channelId}`);
    client.emit('joinedChannel', { messages: recentMessages, channelId: channelId });
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    { channelId, content }: { channelId: number; userId: number; content: string },
    @ConnectedSocket() client: Socket,
    @CurrentWsUser() userId: number,
  ) {
    console.log(`User ${userId} send message to channel ${channelId}`);
    const channel = await this.prisma.textChannel.findUnique({
      where: { id: channelId },
      include: { users: true },
    });

    if (!channel) {
      console.warn(`Channel ${channelId} not found`);
      return client.emit('error', { message: 'Channel not found' });
    }

    const user = channel.users.find((user) => user.id === userId);
    if (!user) {
      return client.emit('error', { message: 'You are not a member of this channel' });
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        authorId: userId,
        textChannelId: channelId,
      },
    });

    this.server.to(`channel_${channelId}`).emit('newMessage', { ...message, author: { name: user.name } });
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(
    @MessageBody() { channelId }: { channelId: number },
    @ConnectedSocket() client: Socket,
    @CurrentWsUser() userId: number,
  ) {
    console.log(`User ${userId} leaving channel ${channelId}`);
    client.leave(`channel_${channelId}`);
    client.emit('leftChannel', { message: `Left channel ${channelId}` });
  }
}
