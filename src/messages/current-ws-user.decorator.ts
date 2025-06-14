import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const CurrentWsUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const client = context.switchToWs().getClient<Socket>();
  // @ts-ignore
  return client.handshake.session?.passport?.user as number;
});
