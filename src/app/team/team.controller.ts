import {
    Body,
    Controller, Get,
    Param,
    Post,
    Res,
    UseGuards
} from '@nestjs/common';
import {Team} from '../../db/entities/Team';
import {User} from '../../db/entities/User';
import {TeamService} from './team.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('team')
export class TeamController {
    constructor(
        private readonly TeamService: TeamService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createTeam(@Body() Team: Team, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.TeamService.createTeam(Team);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post(':id')
    async addMember(@Param('id') id: string, @Body() User: User, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.TeamService.addMember(Number(id), User.nickname);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneTeamById(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.TeamService.findOneTeamById(Number(id));
        response.status(res.code)
        return res
    }
}