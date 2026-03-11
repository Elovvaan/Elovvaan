import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug']
  });

  app.use(['/payments/webhook', '/api/payments/webhook'], express.raw({ type: 'application/json' }));
  app.setGlobalPrefix('api', {
    exclude: ['payments/webhook']
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3000);
  Logger.log(JSON.stringify({ event: 'backend_started', port: 3000 }), 'Bootstrap');
}

bootstrap();
