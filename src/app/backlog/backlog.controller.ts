import {
    Body,
    Controller, Delete, Get,
    Param,
    Post, Put,
    Res,
    UseGuards
} from '@nestjs/common';
import {Backlog} from '../../db/entities/Backlog';
import {BacklogService} from './backlog.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('backlog')
export class BacklogController {
    constructor(
        private readonly backlogService: BacklogService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createBacklog(@Body() Backlog: Backlog, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.backlogService.createBacklog(Backlog);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOneBacklogById(@Param('id') id: string, @Body() Backlog: Backlog, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.backlogService.updateBacklogById(Number(id), Backlog);
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOneBacklogById(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.backlogService.deleteBacklogById(Number(id));
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneBacklogById(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.backlogService.findOneBacklogById(Number(id));
        response.status(res.code)
        return res
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('/user/:created_by')
    async findManyBacklogsByCreatedBy(@Param('created_by') created_by: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.backlogService.findManyBacklogsByCreatedBy(Number(created_by));
        response.status(res.code)
        return res
    }
}
