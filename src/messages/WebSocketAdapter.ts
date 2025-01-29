import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { Server } from 'socket.io';
import * as sharedSession from 'express-socket.io-session';

export class WebSocketAdapter extends IoAdapter {
  private sessionMiddleware: any;

  constructor(app: INestApplication, sessionMiddleware: any) {
    super(app);
    this.sessionMiddleware = sharedSession(sessionMiddleware, {
      autoSave: true,
      saveUninitialized: false,
    });
  }

  createIOServer(port: number, options?: any): any {
    const server: Server = super.createIOServer(port, options);
    server.use(this.sessionMiddleware);
    return server;
  }
}
