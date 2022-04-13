import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import * as path from 'path'
import * as fs from 'fs'
import * as serveStatic from 'serve-static';
import * as http from 'http';
import * as https from 'https';
import * as express from 'express';

async function bootstrap() {
  const server = express();
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname,'../cert/7597188_eden-life.net.cn.key')),
    cert: fs.readFileSync(path.join(__dirname,'../cert/7597188_eden-life.net.cn.pem'))
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule,new ExpressAdapter(server));
  app.use('/public', serveStatic(path.join(__dirname, '../public'), {
    maxAge: '1d',
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
  }));
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
  await app.init();
  http.createServer(server).listen(8080);
  https.createServer(httpsOptions, server).listen(443);
}
bootstrap();
