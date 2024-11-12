import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AllExceptionFilter } from 'interceptors/exception.filter';
import { FindOptionsMiddleware } from 'middlewares/find-options.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.use((req: Request, res: Response, next: NextFunction) => new FindOptionsMiddleware().use(req, res, next));

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
