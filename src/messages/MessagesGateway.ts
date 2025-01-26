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

@WebSocketGateway(80, { cookie: true, cors: ['http://localhost:5173/'] })
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly prisma: PrismaService) {}

  async afterInit(server: any) {
    console.log(server);
    // server.use(sharedSession());
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() { channelId, userId }: { channelId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // client.handshake.session.userdata = userdata;
    // client.handshake.session.save();

    const channel = await this.prisma.textChannel.findUnique({
      where: { id: channelId },
      include: { users: true },
    });

    if (!channel) {
      return client.emit('error', { message: 'Channel not found' });
    }

    // Join the user to the Socket.IO room for the channel
    client.join(`channel_${channelId}`);
    client.emit('joinedChannel', { message: `Joined channel ${channel.name}` });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    { channelId, userId, content }: { channelId: number; userId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const channel = await this.prisma.textChannel.findUnique({ where: { id: channelId } });

    if (!channel) {
      return client.emit('error', { message: 'Channel not found' });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return client.emit('error', { message: 'User not found' });
    }
    const message = await this.prisma.message.create({
      data: {
        content,
        authorId: userId,
        textChannnelId: channelId,
        published: true,
      },
    });
    this.server.to(`channel_${channelId}`).emit('newMessage', message);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(@MessageBody() { channelId }: { channelId: number }, @ConnectedSocket() client: Socket) {
    console.log('user leaving ws channel');
    client.leave(`channel_${channelId}`);
    client.emit('leftChannel', { message: `Left channel ${channelId}` });
  }
}
