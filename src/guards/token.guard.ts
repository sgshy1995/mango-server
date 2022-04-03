import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {RedisInstance} from '../db/redis/redis';
import RedisConfig from '../config/redis.config';

@Injectable()
export class TokenGuard implements CanActivate {
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // 获取请求头里的 token
        const authorization = request['headers'].authorization || void 0;
        const token = authorization.split(' ')[1]; // authorization: Bearer xxx

        // 获取 redis 里缓存的 token
        const redis = await RedisInstance.initRedis('TokenGuard.canActivate', RedisConfig().db);
        const key = `${user.id}-${user.username}`;
        const cache = await redis.get(key);

        if (token !== cache) {
            // 如果 token 不匹配，禁止访问
            throw new UnauthorizedException('登录已过期，请重新登录');
        }
        return true;
    }
}