import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const environment = process.env.NODE_ENV || 'development';
if (environment === 'development')
  require('dotenv').config({ path: __dirname + '/../.env' });

async function bootstrap() {
  let x = null;
  let s = x.Test;
  const app = await NestFactory.create(AppModule, {
    logger:
      environment === 'development'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['error', 'warn'],
  });
  app.enableCors();
  app.use(json({ limit: '50mb' }));

  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Backend').build(),
    ),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
