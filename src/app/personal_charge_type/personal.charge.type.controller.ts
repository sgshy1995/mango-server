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
import {PersonalChargeType} from '../../db/entities/PersonalChargeType';
import {PersonalChargeTypeService} from './personal.charge.type.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('personal_charge_type')
export class PersonalChargeTypeController {
    constructor(
        private readonly personalChargeTypeService: PersonalChargeTypeService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Post()
    async createPersonalChargeType(@Body() personalChargeType: PersonalChargeType, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeTypeService.createPersonalChargeType(personalChargeType);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':id')
    async findOnePersonalChargeTypeById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeTypeService.findOnePersonalChargeTypeById(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Delete(':id')
    async deleteOnePersonalChargeTypeById(@Param('id') id: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeTypeService.deletePersonalCharge(Number(id));
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Put(':id')
    async updateOnePersonalChargeTypeById(@Param('id') id: string, @Body() personalChargeType: PersonalChargeType, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeTypeService.updatePersonalChargeType(Number(id), personalChargeType.name, personalChargeType.icon);
        response.status(res.code);
        return res;
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get()
    async findManyPersonalChargeTypes(@Query() personalChargeTypeOptions: PersonalChargeType, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.personalChargeTypeService.findManyPersonalChargeTypes(personalChargeTypeOptions);
        response.status(res.code);
        return res;
    }
}