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
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Build allowed origins from environment variables
  const allowedOrigins: string[] = [];

  // Add explicit origins from CORS_ORIGIN (comma-separated)
  if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(
      ...process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
    );
  }

  // Add Vercel frontend URL if provided
  if (process.env.VERCEL_FRONTEND_URL) {
    allowedOrigins.push(process.env.VERCEL_FRONTEND_URL.trim());
  }

  // Production domains
  const productionOrigins = [
    'https://swipe2win.app',
    'https://www.swipe2win.app',
  ];
  allowedOrigins.push(...productionOrigins);

  // Vercel preview URL pattern for this project
  const vercelPreviewPattern = /^https:\/\/swipe2swin(-[a-z0-9-]+)?\.vercel\.app$/;

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check Vercel preview URLs pattern
      if (vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }

      // Reject all other origins
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(
    ['/payments/webhook', '/api/payments/webhook'],
    express.raw({ type: 'application/json' }),
  );

  app.setGlobalPrefix('api', {
    exclude: ['payments/webhook'],
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
  logEvent('backend_started', {
    port,
    sentryReady: Boolean(process.env.SENTRY_DSN),
  });
  Logger.log(JSON.stringify({ event: 'backend_started', port }), 'Bootstrap');
}

bootstrap();
