export default () => {
  const isProduction = process.env.NODE_ENV === 'PROD';

  return {
    nodeEnv: process.env.NODE_ENV || 'DEV',
    port: parseInt(process.env.PORT, 10) || 3000,
    websocketPort: parseInt(process.env.WEBSOCKET_PORT, 10) || 3001,
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    session: {
      secret: process.env.SESSION_SECRET,
      maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 1000 * 60 * 30, // 30 minutes
      cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
      },
    },
    database: {
      url: process.env.DATABASE_URL,
    },
  };
};
