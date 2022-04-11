import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {PersonalChargeController} from './personal.charge.controller';
import {PersonalCharge} from '../../db/entities/PersonalCharge';
import {PersonalChargeService} from './personal.charge.service';

import {UserModule} from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([PersonalCharge]), UserModule],
    controllers: [PersonalChargeController],
    providers: [PersonalChargeService],
    exports: [PersonalChargeService]
})
export class PersonalChargeModule {
}