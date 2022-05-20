import {
    Body,
    Controller, Delete, Get,
    Param,
    Post, Put,
    Res,
    UseGuards
} from '@nestjs/common';
import {Birthday} from '../../db/entities/Birthday';
import {BirthdayService} from './birthday.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('birthday')
export class BirthdayController {
    constructor(
        private readonly birthdayService: BirthdayService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createBirthday(@Body() Birthday: Birthday, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.birthdayService.createBirthday(Birthday);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOneBirthdayById(@Param('id') id: string, @Body() Birthday: Birthday, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.birthdayService.updateBirthdayById(Number(id), Birthday);
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOneBirthdayById(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.birthdayService.deleteBirthdayById(Number(id));
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneBirthdayById(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.birthdayService.findOneBirthdayById(Number(id));
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('/user/:created_by')
    async findManyBirthdaysByCreatedBy(@Param('created_by') created_by: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.birthdayService.findManyBirthdaysByCreatedBy(Number(created_by));
        response.status(res.code)
        return res
    }
}
