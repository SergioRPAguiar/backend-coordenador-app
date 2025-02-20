import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as fs from 'fs';

async function bootstrap() {
//   const httpsOptions = {
//     key: fs.readFileSync('/etc/letsencrypt/live/ifms.pro.br/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/ifms.pro.br/fullchain.pem'),
//   };

  const app = await NestFactory.create(AppModule, {
    //httpsOptions,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();


