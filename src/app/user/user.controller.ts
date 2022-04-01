import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Res, HttpStatus, UseGuards} from '@nestjs/common';
import { Response } from 'express';
import {ResponseResult} from '../../types/result.interface';
import {User} from '../../db/entities/User';
import { UserService } from './user.service';
import {AuthService} from "../../logical/auth/auth.service";

import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
    constructor(
      private readonly UserService: UserService,private readonly authService: AuthService,
    ) { }

    @Post('login')
    async login(@Body() User: User,@Res({ passthrough: true }) response: Response) {
        console.log('JWT验证 - Step 1: 用户请求登录');
        const authResult = await this.authService.validateUser(User.username, User.password);
        switch (authResult.code) {
            case 1:
                const resRight = await this.authService.certificate(authResult.user);
                response.status(resRight.code)
                response.send(resRight)
                break
            default:
                const resDefault = {
                    code: HttpStatus.BAD_REQUEST,
                    message: `账号或密码不正确`,
                };
                response.status(resDefault.code)
                response.send(resDefault)
                break
        }
    }

    @Post()
    async createUser(@Body() User: User,@Res({ passthrough: true }) response: Response): Promise<ResponseResult | void> {
        const res = await this.UserService.createUser(User)
        response.status(res.code)
        response.send(res)
    }

    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<ResponseResult> {
        await this.UserService.deleteUser(id);
        return { code: 200, message: '删除成功' };
    }

    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() User: User): Promise<ResponseResult> {
        await this.UserService.updateCat(id, User);
        return { code: 200, message: '更新成功' };
    }

    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneUser(@Param('id') id: number): Promise<ResponseResult> {
        const data = await this.UserService.findOneUser(id);
        return { code: 200, message: '查询成功', data };
    }
}