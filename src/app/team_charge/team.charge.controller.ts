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
import {TeamCharge} from '../../db/entities/TeamCharge';
import {TeamChargeService} from './team.charge.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('team_charge')
export class TeamChargeController {
    constructor(
        private readonly teamChargeService: TeamChargeService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createTeamCharge(@Body() teamCharge: TeamCharge, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeService.createTeamCharge(teamCharge);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneTeamById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeService.findOneTeamChargeById(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOneTeamById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeService.deleteTeamCharge(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOneTeamById(@Param('id') id: string, @Body() teamCharge: TeamCharge, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeService.updateTeamCharge(Number(id), teamCharge.charge_num, teamCharge.remark);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get()
    async findManyTeamCharges(@Query() teamChargeOptions: TeamCharge & { charge_time_range: string[] }, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeService.findManyTeamCharges(teamChargeOptions);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('time/find')
    async findManyPersonalChargesByCustomTime(@Query() timeOptions: { team_id: string, time_type: 'week' | 'month' | 'year', year: string, index: string }, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const {team_id, time_type, year, index} = timeOptions;
        const res = await this.teamChargeService.findManyChargesByTime(Number(team_id), time_type, Number(year), Number(index));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get('time/find_recent')
    async findManyRecentTeamChargesByCustomTime(@Query() timeOptions: { team_id: string, time_start: string, time_end: string }, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const {team_id, time_start, time_end} = timeOptions;
        const res = await this.teamChargeService.findManyChargesRecentByTime(Number(team_id), time_start, time_end);
        response.status(res.code);
        return res;
    }
}
