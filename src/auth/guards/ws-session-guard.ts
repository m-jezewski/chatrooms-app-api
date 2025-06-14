import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WsSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const session = client.handshake?.session;

    return !!session?.passport?.user;
  }
}
