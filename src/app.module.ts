import {Module} from '@nestjs/common';
import { APP_INTERCEPTOR,APP_FILTER } from '@nestjs/core';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';

// 全局错误处理
import {ErrorsInterceptor} from './common/errors.interceptor';

// 数据库配置
const isProd = process.env.NODE_ENV === 'production';
import databaseConfig from './config/database.config';

// 引入 modules
import {UserModule} from './app/user/user.module';
import {StatusFilter} from './common/errors.filter';

@Module({
    imports: [
        // .env config
        // TODO 自定义的配置文件，必须再load，不然无法读取
        ConfigModule.forRoot({
            envFilePath: isProd ? '.env.production' : '.env.development',
            isGlobal: true,
            load: [databaseConfig]
        }),
        // typeorm 连接数据库
        TypeOrmModule.forRoot({
            ...databaseConfig(),
            entities: [],
            synchronize: false,
            autoLoadEntities: true
        }),
        // modules
        UserModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ErrorsInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: StatusFilter,
        },
        AppService
    ],
})
export class AppModule {
}