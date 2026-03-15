import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://swipe2win.app',
      'https://swipe2swin.vercel.app',
      'https://swipe2swin-git-main-elovvaans-projects.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  Logger.log(JSON.stringify({ event: 'backend_started', port }), 'Bootstrap');
}

bootstrap();
