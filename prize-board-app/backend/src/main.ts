import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';
import { logError, logEvent } from './common/observability';

async function bootstrap() {
  process.on('unhandledRejection', (reason) => {
    logError('process_unhandled_rejection', reason);
  });

  process.on('uncaughtException', (error) => {
    logError('process_uncaught_exception', error);
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug']
  });

  app.enableCors({
    origin: [
      'https://swipe2win.app',
      'https://swipe2swin.vercel.app',
      'https://swipe2swin-git-main-elovvaans-projects.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
  });

  app.use(['/payments/webhook', '/api/payments/webhook'], express.raw({ type: 'application/json' }));
  app.setGlobalPrefix('api', {
    exclude: ['payments/webhook']
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
  logEvent('backend_started', { port, sentryReady: Boolean(process.env.SENTRY_DSN) });
  Logger.log(JSON.stringify({ event: 'backend_started', port }), 'Bootstrap');
}

bootstrap().catch((error) => {
  logError('backend_boot_failed', error);
  process.exit(1);
});
app.enableCors({
  origin: [
    'https://swipe2win.app',
    'https://www.swipe2win.app',
    'https://swipe2swin.vercel.app',
    'https://swipe2swin-elovvaans-projects.vercel.app',
    'https://swipe2swin-git-main-elovvaans-projects.vercel.app',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
