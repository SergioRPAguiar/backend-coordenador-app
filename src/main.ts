import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Rejeita propriedades que não estão no DTO
  }));

  await app.listen(3000);
}
bootstrap();
