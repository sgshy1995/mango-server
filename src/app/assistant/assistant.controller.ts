import {
    Controller,
    Get, Param,
    Res,
    UseGuards
} from '@nestjs/common';
import {AssistantService} from './assistant.service';

import {AuthGuard} from '@nestjs/passport';
import {TokenGuard} from '../../guards/token.guard';
import {Response} from 'express';

@Controller('assistant')
export class AssistantController {
    constructor(
        private readonly assistantService: AssistantService
    ) {
    }

    @UseGuards(new TokenGuard()) // 使用 token redis 验证
    @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
    @Get(':province')
    async getGasInfoByProvince(@Param('province') province: string, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        console.log('province================', province);
        const res = await this.assistantService.getGasInfoByProvince(province);
        response.status(res.code);
        return res;
    }
}
