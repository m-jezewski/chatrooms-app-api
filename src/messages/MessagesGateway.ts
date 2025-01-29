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

@WebSocketGateway(3001, {
  cors: {
    origin: 'http://localhost:5173',
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
      // @ts-ignore todo: evil ts-ignore usage
      const session = socket.handshake.session;

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

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() { channelId, userId }: { channelId: number; userId: number },
    @ConnectedSocket() client: Socket,
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

    client.join(`channel_${channelId}`);
    client.emit('joinedChannel', { messages: recentMessages, channelId: channelId });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    { channelId, userId, content }: { channelId: number; userId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`User ${userId} send message to channel ${channelId}`);
    const channel = await this.prisma.textChannel.findUnique({ where: { id: channelId } });

    if (!channel) {
      console.warn(`Channel ${channelId} not found`);
      return client.emit('error', { message: 'Channel not found' });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.warn(`User ${userId} not found`);
      return client.emit('error', { message: 'User not found' });
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

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(@MessageBody() { channelId }: { channelId: number }, @ConnectedSocket() client: Socket) {
    console.log(`User leaving channel ${channelId}`);
    client.leave(`channel_${channelId}`);
    client.emit('leftChannel', { message: `Left channel ${channelId}` });
  }
}
