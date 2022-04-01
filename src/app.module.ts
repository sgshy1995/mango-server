import {Module} from '@nestjs/common';
import { APP_INTERCEPTOR,APP_FILTER } from '@nestjs/core';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';

// 全局错误处理
import {ErrorsInterceptor} from './common/errors.interceptor';

// 环境判断
const isProd = process.env.NODE_ENV === 'production';

// 数据库配置

import databaseConfig from './config/database.config';

// JWT配置
import jwtConfig from "./config/jwt.config";

// 引入 modules
import {UserModule} from './app/user/user.module';
import {StatusFilter} from './common/errors.filter';
import { AuthModule } from './logical/auth/auth.module';
import { UserController } from "./app/user/user.controller";

@Module({
    imports: [
        // .env config
        // TODO 自定义的配置文件，必须再load，不然无法读取
        ConfigModule.forRoot({
            envFilePath: isProd ? '.env.production' : '.env.development',
            isGlobal: true,
            load: [databaseConfig,jwtConfig]
        }),
        // typeorm 连接数据库
        TypeOrmModule.forRoot({
            ...databaseConfig(),
            entities: [],
            synchronize: false,
            autoLoadEntities: true
        }),
        // modules
        UserModule,
        AuthModule
    ],
    controllers: [AppController,UserController],
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