import {
    Body,
    Query,
    Controller, Delete, Get,
    Param,
    Post,
    Put,
    Res,
    UseGuards
} from '@nestjs/common';
import {PersonalCharge} from '../../db/entities/PersonalCharge';
import {PersonalChargeService} from './personal.charge.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('personal_charge')
export class PersonalChargeController {
    constructor(
        private readonly personalChargeService: PersonalChargeService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createPersonalCharge(@Body() personalCharge: PersonalCharge, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeService.createPersonalCharge(personalCharge);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneTeamById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeService.findOnePersonalChargeById(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOneTeamById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeService.deletePersonalCharge(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOneTeamById(@Param('id') id: string, @Body() personalCharge: PersonalCharge, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeService.updatePersonalCharge(Number(id), personalCharge.charge_num, personalCharge.remark);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get()
    async findManyPersonalCharges(@Query() personalChargeOptions: PersonalCharge & { charge_time_range: string[] }, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeService.findManyPersonalCharges(personalChargeOptions);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('time/find')
    async findManyPersonalChargesByCustomTime(@Query() timeOptions: { created_by: string, time_type: 'week' | 'month' | 'year', year: string, index: string }, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const {created_by, time_type, year, index} = timeOptions;
        const res = await this.personalChargeService.findManyChargesByTime(Number(created_by), time_type, Number(year), Number(index));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('time/find_recent')
    async findManyRecentPersonalChargesByCustomTime(@Query() timeOptions: { created_by: string, time_start: string, time_end: string }, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const {created_by, time_start, time_end} = timeOptions;
        const res = await this.personalChargeService.findManyChargesRecentByTime(Number(created_by), time_start, time_end);
        response.status(res.code);
        return res;
    }
}
