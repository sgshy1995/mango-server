import * as Redis from 'ioredis';
//import { Logger } from '../utils/log4js';
import redisConfig from '../../config/redis.config';

let n: number = 0;
const redisIndex = []; // 用于记录 redis 实例索引
const redisList = []; // 用于存储 redis 实例

export class RedisInstance {
    static async initRedis(method: string, db: number = 0) {
        const isExist = redisIndex.some(x => x === db);
        if (!isExist) {
            //Logger.debug(`[Redis ${db}]来自 ${method} 方法调用, Redis 实例化了 ${++n} 次 `);
            console.log(`[Redis ${db}]来自 ${method} 方法调用, Redis 实例化了 ${++n} 次 `)
            // @ts-ignore
            redisList[db] = new Redis({ ...redisConfig(), db });
            redisIndex.push(db);
        } else {
            console.log(`[Redis ${db}]来自 ${method} 方法调用`)
            //Logger.debug(`[Redis ${db}]来自 ${method} 方法调用`);
        }
        return redisList[db];
    }
}
