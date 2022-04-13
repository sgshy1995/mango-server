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
import {TeamChargeType} from '../../db/entities/TeamChargeType';
import {TeamChargeTypeService} from './team.charge.type.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('team_charge_type')
export class TeamChargeTypeController {
    constructor(
        private readonly teamChargeTypeService: TeamChargeTypeService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createTeamChargeType(@Body() teamChargeType: TeamChargeType, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeTypeService.createTeamChargeType(teamChargeType);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneTeamChargeTypeById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeTypeService.findOneTeamChargeTypeById(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOneTeamChargeTypeById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeTypeService.deleteTeamCharge(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOneTeamChargeTypeById(@Param('id') id: string, @Body() teamChargeType: TeamChargeType, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeTypeService.updateTeamChargeType(Number(id), teamChargeType.name, teamChargeType.icon);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get()
    async findManyTeamChargeTypes(@Query() teamChargeTypeOptions: TeamChargeType, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.teamChargeTypeService.findManyTeamChargeTypes(teamChargeTypeOptions);
        response.status(res.code);
        return res;
    }
}