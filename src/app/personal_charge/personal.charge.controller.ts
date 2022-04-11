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
        private readonly PersonalChargeService: PersonalChargeService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createPersonalCharge(@Body() personalCharge: PersonalCharge, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.PersonalChargeService.createPersonalCharge(personalCharge);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOneTeamById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.PersonalChargeService.findOnePersonalChargeById(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOneTeamById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.PersonalChargeService.deletePersonalCharge(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOneTeamById(@Param('id') id: string, @Body() personalCharge: PersonalCharge, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.PersonalChargeService.updatePersonalCharge(Number(id), personalCharge.charge_num, personalCharge.remark);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get()
    async findManyPersonalCharges(@Query() PersonalChargeOptions: PersonalCharge & { charge_time_range: string[] }, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.PersonalChargeService.findManyPersonalCharges(PersonalChargeOptions);
        console.log('res',res)
        response.status(res.code);
        return res;
    }
}