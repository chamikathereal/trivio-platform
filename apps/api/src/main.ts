import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('TrivioApiBootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const corsOrigins = configService.get<string[]>('CORS_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ]);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
  logger.log(`Trivio Cloud API service listening on http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during Trivio API bootstrap:', err);
  process.exit(1);
});
