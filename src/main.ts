import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { PrismaExceptionFilter } from './prisma/PrismaClientExceptionFilter';
import { WebSocketAdapter } from './messages/WebSocketAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressSession = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 30,
      httpOnly: true,
    },
  });

  app.use(expressSession);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.use((req, res, next) => {
    if (req.session) {
      req.session.cookie.maxAge = 1000 * 60 * 30;
    }
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.useWebSocketAdapter(new WebSocketAdapter(app, expressSession));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
