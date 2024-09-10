import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  dotenv.config();
  const port = process.env.PORT || 4000;

  const corsOptions: CorsOptions = {
    origin: /localhost:300(0|1)/,
    credentials: true,
  };

  const app = await NestFactory.create(AppModule, { cors: corsOptions });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
