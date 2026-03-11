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

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
  Logger.log(JSON.stringify({ event: 'backend_started', port }), 'Bootstrap');
}

bootstrap();
