import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //app.enableCors({
    //origin: 'https://www.ifms.pro.br',
    //credentials: true
  //});

  app.enableCors({
    origin: true, 
    credentials: true
  });

  //app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000, '0.0.0.0');
  console.log(`Server running on: ${await app.getUrl()}`);
}
bootstrap();