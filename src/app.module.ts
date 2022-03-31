import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';

import databaseConfig from './config/database.config';

const isProd = process.env.NODE_ENV === 'production';

@Module({
    imports: [
        // .env config
        ConfigModule.forRoot({
            envFilePath: isProd ? '.env.production' : '.env.development',
            isGlobal: true,
            load: [databaseConfig]
        }),
        // typeorm 连接数据库
        TypeOrmModule.forRoot({
            ...databaseConfig(),
            entities: [],
            synchronize: false
        })
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
