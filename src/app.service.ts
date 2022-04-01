import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'You are running NestJs@8.0.0, have a enjoyed time!';
  }
}