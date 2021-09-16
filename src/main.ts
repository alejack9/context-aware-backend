import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/./../alwaysdata.env' });
const environment = process.env.NODE_ENV || 'development';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      environment === 'development'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['error', 'warn'],
  });
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
