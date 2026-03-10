import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(['/payments/webhook', '/api/payments/webhook'], express.raw({ type: 'application/json' }));
  app.setGlobalPrefix('api', {
    exclude: ['payments/webhook']
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
}

bootstrap();
