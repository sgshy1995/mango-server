import {
    Body,
    Controller,
    Post,
    Res,
    UseGuards
} from '@nestjs/common';
import {PersonalSortService} from './personal.sort.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('personal_sort')
export class PersonalSortController {
    constructor(
        private readonly personalSortService: PersonalSortService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async updatePersonalSortByUser(@Body() options: {created_by: number, balance_type: number, origin_id: number, move_id: number}, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        console.log('options================', options)
        const res = await this.personalSortService.updatePersonalSortByUser(options.created_by, options.balance_type, options.origin_id, options.move_id);
        response.status(res.code);
        return res;
    }
}
