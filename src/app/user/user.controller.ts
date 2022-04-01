import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Res, HttpStatus} from '@nestjs/common';
import { Response } from 'express';
import {ResponseResult} from '../../types/result.interface';
import {User} from '../../db/entities/User';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        @Inject(UserService) private readonly UserService: UserService,
    ) { }

    @Post()
    async createUser(@Body() User: User,@Res({ passthrough: true }) response: Response): Promise<ResponseResult | void> {
        const res = await this.UserService.createUser(User)
        response.status(res.code)
        response.send(res)
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<ResponseResult> {
        await this.UserService.deleteUser(id);
        return { code: 200, message: '删除成功' };
    }

    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() User: User): Promise<ResponseResult> {
        await this.UserService.updateCat(id, User);
        return { code: 200, message: '更新成功' };
    }

    @Get(':id')
    async findOneUser(@Param('id') id: number): Promise<ResponseResult> {
        const data = await this.UserService.findOneUser(id);
        return { code: 200, message: '查询成功', data };
    }
}