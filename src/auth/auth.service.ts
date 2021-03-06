import {HttpStatus, Injectable} from '@nestjs/common';
import {UserService} from '../app/user/user.service';
import {JwtService} from '@nestjs/jwt';
import {encryptPassword} from '../utils/cryptogram';
import {User} from '../db/entities/User';
import {ResponseResult} from '../types/result.interface';
import {RedisInstance} from '../db/redis/redis';
import RedisConfig from '../config/redis.config';
import * as svgCaptcha from 'svg-captcha';
import mail from '../utils/mail';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {
    }

    // 生成 capture 并记录到redis中
    async generateCapture(device_id: string): Promise<String | ResponseResult> {
        // 实例化 redis
        if (!device_id){
            return {
                code: HttpStatus.BAD_REQUEST,
                message: '参数错误'
            }
        }
        const redis = await RedisInstance.initRedis('auth.capture', 0);
        const captcha = svgCaptcha.create({
            size: 4,
            ignoreChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            color: false,
            fontSize: 60,
            noise: 2
        });
        await redis.setex(device_id, 300, captcha.text);
        return `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`;
    }

    // capture 验证
    async validateCapture(device_id: string, capture: string): Promise<ResponseResult | undefined> {
        // 实例化 redis
        const redis = await RedisInstance.initRedis('auth.capture', 0);
        const cache = await redis.get(device_id);
        if (!device_id || !capture){
            return {
                code: HttpStatus.BAD_REQUEST,
                message: '参数错误'
            };
        }else if (!cache) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: '验证码不存在'
            };
        } else if (cache.toLowerCase() !== capture.toLowerCase()) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: '验证码错误'
            };
        } else {
            return undefined;
        }
    }

    // 生成 capture_email 并记录到redis中
    async generateCaptureEmail(device_id: string, email: string): Promise<ResponseResult> {
        const responseBody = {
            code: HttpStatus.CREATED,
            message: '已发送'
        }
        // 实例化 redis
        if (!device_id || !email){
            return {
                code: HttpStatus.BAD_REQUEST,
                message: '参数错误'
            }
        }
        const userFind = await this.usersService.findOneByEmail(email)
        if (userFind) {
            return {
                code: HttpStatus.CONFLICT,
                message: '该邮箱已注册'
            };
        }
        const redis = await RedisInstance.initRedis('auth.capture.email', 0);
        const cache = await redis.get(`${device_id}~${email}`);
        if (cache) {
            return {
                code: HttpStatus.CONFLICT,
                message: '验证码仍在有效期'
            };
        }
        const captcha = svgCaptcha.create({
            size: 6,
            ignoreChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            color: false,
            fontSize: 60,
            noise: 2
        });
        let errMsg = ''
        try {
            await mail(captcha.text, email)
        }catch (e) {
            errMsg = e
        }
        if (!errMsg){
            await redis.setex(`${device_id}~${email}`, 300, captcha.text);
        }else{
            responseBody.code = HttpStatus.BAD_REQUEST
            responseBody.message = '邮件服务器错误'
        }
        return responseBody;
    }

    // capture_email 验证
    async validateCaptureEmail(device_id: string, email: string, capture_email: string): Promise<ResponseResult | undefined> {
        // 实例化 redis
        const redis = await RedisInstance.initRedis('auth.capture.email', 0);
        const cache = await redis.get(`${device_id}~${email}`);
        if (!device_id || !email || !capture_email){
            return {
                code: HttpStatus.BAD_REQUEST,
                message: '邮箱参数错误'
            };
        }else if (!cache) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: '邮箱验证码不存在'
            };
        } else if (cache.toLowerCase() !== capture_email.toLowerCase()) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: '邮箱验证码错误'
            };
        } else {
            return undefined;
        }
    }

    // JWT验证 - Step 2: 校验用户信息-用户名
    async validateUserByUsername(username: string, password: string): Promise<{ code: number, user: User | null }> {
        const user = await this.usersService.findOneByUsername(username);
        console.log('JWT验证 - Step 2: 校验用户信息 -- 用户名登录', user, 'password', password);
        if (user) {
            const hashedPassword = user.password;
            const salt = user.salt;
            // 通过密码盐，加密传参，再与数据库里的比较，判断是否相等
            const hashPassword = encryptPassword(password, salt);
            if (hashedPassword === hashPassword) {
                // 密码正确
                console.log('密碼正確');
                return {
                    code: 1,
                    user
                };
            } else {
                // 密码错误
                console.log('密碼錯誤');
                return {
                    code: 2,
                    user: null
                };
            }
        }
        // 查无此人
        console.log('查無此人');
        return {
            code: 3,
            user: null
        };
    }

    // JWT验证 - Step 2: 校验用户信息-邮箱
    async validateUserByEmail(email: string, password: string): Promise<{ code: number, user: User | null }> {
        const user = await this.usersService.findOneByEmail(email);
        console.log('JWT验证 - Step 2: 校验用户信息 -- 邮箱登录', user, 'password', password);
        if (user) {
            const hashedPassword = user.password;
            const salt = user.salt;
            // 通过密码盐，加密传参，再与数据库里的比较，判断是否相等
            const hashPassword = encryptPassword(password, salt);
            if (hashedPassword === hashPassword) {
                // 密码正确
                console.log('密碼正確');
                return {
                    code: 1,
                    user
                };
            } else {
                // 密码错误
                console.log('密碼錯誤');
                return {
                    code: 2,
                    user: null
                };
            }
        }
        // 查无此人
        console.log('查無此人');
        return {
            code: 3,
            user: null
        };
    }

    // JWT验证 - Step 3: 处理 jwt 签证
    async certificate(user: User, login_type: string): Promise<ResponseResult> {
        const payload = {username: user.username, sub: user.id, nickname: user.nickname, primary_key: user.primary_key};
        console.log('JWT验证 - Step 3: 处理 jwt 签证');
        console.log('payload', payload);
        try {
            const token = this.jwtService.sign(payload);
            // 实例化 redis
            const redis = await RedisInstance.initRedis('auth.certificate', 0);
            // 将用户信息和 token 存入 redis，并设置失效时间，语法：[key, seconds, value]
            await redis.setex(`${user.id}-${user.username}`, 2592000, `${token}`);
            return {
                code: HttpStatus.OK,
                data: {
                    token,
                },
                message: `登录成功`,
            };
        } catch (error) {
            console.log('error', error);
            return {
                code: HttpStatus.BAD_REQUEST,
                message: login_type === 'username' ? '账号或密码错误' : '邮箱或密码错误',
            };
        }
    }

    // JWT 注销签证
    async dropJwt(user: User): Promise<ResponseResult> {
        const redis = await RedisInstance.initRedis('TokenGuard.canActivate', RedisConfig().db);
        const key = `${user.id}-${user.username}`;
        const cache = await redis.get(key);
        if (cache) {
            await redis.del(key);
        }
        return {
            code: HttpStatus.OK,
            message: `注销成功`
        };
    }
}
