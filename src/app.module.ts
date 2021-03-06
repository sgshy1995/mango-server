import {Module, MiddlewareConsumer, RequestMethod} from '@nestjs/common';
import {APP_INTERCEPTOR, APP_FILTER} from '@nestjs/core';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';
import {PathMiddleware} from './middleware/path.middleware';

// 全局错误处理
import {ErrorsInterceptor} from './common/errors.interceptor';

// 环境判断
const isProd = process.env.NODE_ENV === 'production';

// 数据库配置

import databaseConfig from './config/database.config';

// JWT配置
import jwtConfig from './config/jwt.config';

// Redis配置
import redisConfig from './config/redis.config';

// Mail配置
import mailConfig from './config/mail.config';

// 引入 modules
import {UserModule} from './app/user/user.module';
import {TeamModule} from './app/team/team.module';
import {PersonalChargeModule} from './app/personal_charge/personal.charge.module';
import {PersonalChargeTypeModule} from './app/personal_charge_type/personal.charge.type.module';
import {TeamChargeModule} from './app/team_charge/team.charge.module';
import {TeamChargeTypeModule} from './app/team_charge_type/team.charge.type.module';
import {StatusFilter} from './common/errors.filter';
import {AuthModule} from './auth/auth.module';
import {UserController} from './app/user/user.controller';
import {InfoModule} from './app/info/info.module';
import {MemorialDayModule} from './app/memorial_day/memorial.day.module';
import {BirthdayModule} from './app/birthday/birthday.module';
import {BacklogModule} from './app/backlog/backlog.module';
import {PersonalSortModule} from './app/personal_sort/personal.sort.module';
import {TeamSortModule} from './app/team_sort/team.sort.module';
import {AssistantModule} from './app/assistant/assistant.module';

@Module({
    imports: [
        // .env config
        // TODO 自定义的配置文件，必须再load，不然无法读取
        ConfigModule.forRoot({
            envFilePath: isProd ? '.env.production' : '.env.development',
            isGlobal: true,
            load: [databaseConfig, jwtConfig, redisConfig, mailConfig]
        }),
        // typeorm 连接数据库
        TypeOrmModule.forRoot({
            ...databaseConfig(),
            entities: [],
            synchronize: false,
            autoLoadEntities: true,
            timezone: 'Z'
        }),
        // modules
        UserModule,
        TeamModule,
        PersonalChargeModule,
        PersonalChargeTypeModule,
        TeamChargeModule,
        TeamChargeTypeModule,
        InfoModule,
        AuthModule,
        MemorialDayModule,
        BirthdayModule,
        BacklogModule,
        PersonalSortModule,
        TeamSortModule,
        AssistantModule
    ],
    controllers: [AppController, UserController],
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
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(PathMiddleware)
            .forRoutes(
                {path: 'user/upload', method: RequestMethod.POST},
                {path: 'info/upload/background', method: RequestMethod.POST},
                {path: 'info/upload/avatar', method: RequestMethod.POST}
            );
    }
}
