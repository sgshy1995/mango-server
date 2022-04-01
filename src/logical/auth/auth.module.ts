// src/logical/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import {  UserModule  } from "../../app/user/user.module";
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { ConfigModule } from "@nestjs/config";

// 环境判断
const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    // .env config
    // TODO 自定义的配置文件，必须再load，不然无法读取
    ConfigModule.forRoot({
      envFilePath: isProd ? '.env.production' : '.env.development',
      isGlobal: true,
      load: [jwtConfig]
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig().secret,
      signOptions: { expiresIn: '1h' }, // token 过期时效
    }),
    UserModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}