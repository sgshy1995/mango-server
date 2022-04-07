import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path'
import * as serveStatic from 'serve-static';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204
    }
  });
  app.use('/public', serveStatic(path.join(__dirname, '../public'), {
    maxAge: '1d',
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
  }));
  await app.listen(8080);
}
bootstrap();
