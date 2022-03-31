import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';

import {databaseConfig} from './config/configuration';

const isProd = process.env.NODE_ENV === 'production';

@Module({
    imports: [
        // .env config
        ConfigModule.forRoot({
            envFilePath: isProd ? '.env.production' : '.env.development',
            isGlobal: true,
            load: [databaseConfig]
        }),
        // typeorm 连接
        TypeOrmModule.forRoot({
          database: '',
          entities: [],
          synchronize: true,
          ...databaseConfig()
        })
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
