import {
    Body,
    Controller,
    Post,
    Res,
    UseGuards
} from '@nestjs/common';
import {TeamSortService} from './team.sort.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('team_sort')
export class TeamSortController {
    constructor(
        private readonly teamSortService: TeamSortService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async updateTeamSortByUser(@Body() options: {team_id: number, balance_type: number, origin_id: number, move_id: number}, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        console.log('options================', options)
        const res = await this.teamSortService.updateTeamSortByUser(options.team_id, options.balance_type, options.origin_id, options.move_id);
        response.status(res.code);
        return res;
    }
}
