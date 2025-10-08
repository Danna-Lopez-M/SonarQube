import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as cors from "cors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const cors = require('cors');

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(cors());

  app.use((req, res, next) => {
    if (req.headers['content-type']?.includes('text/plain') && req.method === 'POST') {
      req.headers['content-type'] = 'application/json';
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API de Equipos')
    .setDescription(
      'API para gestionar equipos de computación, impresoras y teléfonos.',
    )
    .setVersion('1.0')
    .addTag('equipos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
