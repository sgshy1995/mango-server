import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Res, Req, HttpStatus, UseGuards, UseInterceptors ,UploadedFile} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import {ResponseResult} from '../../types/result.interface';
import {User} from '../../db/entities/User';
import { UserService } from './user.service';
import {AuthService} from "../../auth/auth.service";

import { AuthGuard } from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';

import * as fs from 'fs';
import * as path from 'path';
import * as nuid from 'nuid';
import moment = require("moment");

import multer = require('multer');

interface RequestParams extends Request{
    user: User
}

@Controller('user')
export class UserController {
    constructor(
      private readonly UserService: UserService,private readonly authService: AuthService,
    ) { }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post('upload')
    @UseInterceptors(FileInterceptor('file',{
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(process.env.UPLOAD_PATH,`/users/${moment(new Date(),'YYYY-MM-DD').format('YYYY-MM-DD')}`));
            },
            filename: (req, file, cb) => {
                // 自定义文件名
                const filename = `${nuid.next()}.${file.mimetype.split('/')[1]}`;
                return cb(null, filename);
            },
        }),
    }))
    async uploadFile(@UploadedFile() file,@Res({ passthrough: true }) response: Response,@Req() request: RequestParams) {
        console.log(file);
        console.log(request.user);
        await this.UserService.updateUser(request.user.id, {...request.user,avatar: file.path});
        const res = {
            code: HttpStatus.OK,
            message: '上传成功'
        }
        response.status(res.code)
        response.send(res)
    }

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
    async createUser(@Body() User: User,@Res({ passthrough: true }) response: Response): Promise<void> {
        const bodyCopy = Object.assign({},User)
        const res = await this.UserService.createUser(User)
        if (res.code === HttpStatus.CREATED) {
            const authResult = await this.authService.validateUser(bodyCopy.username, bodyCopy.password);
            res.data = (await this.authService.certificate(authResult.user)).data;
        }
        response.status(res.code)
        response.send(res)
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':username')
    async findOneUserByUsername(@Param('username') username: string, @Res({ passthrough: true }) response: Response): Promise<void> {
        const res = await this.UserService.findOneUserByUsername(username);
        response.status(res.code)
        response.send(res)
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<ResponseResult> {
        await this.UserService.deleteUser(id);
        return { code: 200, message: '删除成功' };
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() User: User): Promise<ResponseResult> {
        await this.UserService.updateUser(id, User);
        return { code: 200, message: '更新成功' };
    }
}