import {
    Query,
    Controller,
    Get,
    Res, HttpStatus
} from '@nestjs/common';
import {AuthService} from './auth.service';

import {Response} from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {
    }

    @Get('capture')
    async getCapture(@Query() device_id_info: {device_id: string}, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.authService.generateCapture(device_id_info.device_id);
        if (res && typeof res === 'object'){
            // @ts-ignore
            response.status(res.code);
        }else{
            response.status(HttpStatus.OK);
            response.type('svg')
        }
        return res;
    }

    @Get('capture_email')
    async getCaptureEmail(@Query() device_id_info: {device_id: string, email: string}, @Res({passthrough: true}) response: Response): Promise<Response | void | Record<string, any>> {
        const res = await this.authService.generateCaptureEmail(device_id_info.device_id, device_id_info.email);
        response.status(res.code);
        return res;
    }
}
