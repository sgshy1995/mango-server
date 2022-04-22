import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Res, Req, HttpStatus, UseGuards, UseInterceptors ,UploadedFile} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { User } from '../../db/entities/User';
import { InfoService } from './info.service';

import { AuthGuard } from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';

import * as path from 'path';
import * as nuid from 'nuid';
import moment = require("moment");

import multer = require('multer');
import {ResponseResult} from '../../types/result.interface';
import {Info} from '../../db/entities/Info';

interface RequestParams extends Request{
    user: User
}

@Controller('info')
export class InfoController {
    constructor(
      private readonly infoService: InfoService
    ) { }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post('upload/background')
    @UseInterceptors(FileInterceptor('file',{
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(process.env.UPLOAD_PATH,`/infos/background/${moment(new Date(),'YYYY-MM-DD').format('YYYY-MM-DD')}`));
            },
            filename: (req, file, cb) => {
                // 自定义文件名
                const filename = `${nuid.next()}.${file.mimetype.split('/')[1]}`;
                return cb(null, filename);
            },
        }),
    }))
    async uploadFileBackground(@UploadedFile() file,@Res({ passthrough: true }) response: Response,@Req() request: RequestParams): Promise<Response | void | Record<string, any>> {
        console.log(file);
        console.log(request.user);
        // @ts-ignore
        await this.infoService.updateInfoByUserId(request.user.id, {money_background: file.path.split(path.sep).join('/')});
        const res = {
            code: HttpStatus.OK,
            message: '上传成功'
        }
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post('upload/avatar')
    @UseInterceptors(FileInterceptor('file',{
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(process.env.UPLOAD_PATH,`/infos/avatar/${moment(new Date(),'YYYY-MM-DD').format('YYYY-MM-DD')}`));
            },
            filename: (req, file, cb) => {
                // 自定义文件名
                const filename = `${nuid.next()}.${file.mimetype.split('/')[1]}`;
                return cb(null, filename);
            },
        }),
    }))
    async uploadFileAvatar(@UploadedFile() file,@Res({ passthrough: true }) response: Response,@Req() request: RequestParams): Promise<Response | void | Record<string, any>> {
        console.log(file);
        console.log(request.user);
        // @ts-ignore
        await this.infoService.updateInfoByUserId(request.user.id, {money_avatar: file.path.split(path.sep).join('/')});
        const res = {
            code: HttpStatus.OK,
            message: '上传成功'
        }
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('user/:user_id')
    async findOneTeamById(@Param('user_id') user_id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.infoService.findOneInfoById(Number(user_id));
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put('user/:user_id')
    async updateInfo(@Param('user_id') user_id: string, @Body() info: Info, @Res({ passthrough: true }) response: Response): Promise<ResponseResult> {
        const res = await this.infoService.updateInfoByUserId(Number(user_id), info);
        response.status(res.code)
        return res
    }
}