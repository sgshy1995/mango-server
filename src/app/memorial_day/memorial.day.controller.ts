import {
    Body,
    Controller, Delete, Get,
    Param,
    Post, Put,
    Res,
    UseGuards
} from '@nestjs/common';
import {MemorialDay} from '../../db/entities/MemorialDay';
import {MemorialDayService} from './memorial.day.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('memorial_day')
export class MemorialDayController {
    constructor(
        private readonly memorialDayService: MemorialDayService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createMemorialDay(@Body() MemorialDay: MemorialDay, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.memorialDayService.createMemorialDay(MemorialDay);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOneMemorialDayById(@Param('id') id: string, @Body() MemorialDay: MemorialDay, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.memorialDayService.updateMemorialDayById(Number(id), MemorialDay);
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOneMemorialDayById(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.memorialDayService.deleteMemorialDayById(Number(id));
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneMemorialDayById(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.memorialDayService.findOneMemorialDayById(Number(id));
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('/user/:created_by')
    async findManyMemorialDaysByCreatedBy(@Param('created_by') created_by: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.memorialDayService.findManyMemorialDaysByCreatedBy(Number(created_by));
        response.status(res.code)
        return res
    }
}
