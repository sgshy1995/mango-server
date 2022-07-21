import {Module,forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {PersonalChargeController} from './personal.charge.controller';
import {PersonalCharge} from '../../db/entities/PersonalCharge';
import {PersonalChargeService} from './personal.charge.service';

import {UserModule} from '../user/user.module';

import {PersonalChargeTypeModule} from '../personal_charge_type/personal.charge.type.module';

@Module({
    imports: [TypeOrmModule.forFeature([PersonalCharge]), UserModule, forwardRef(()=>PersonalChargeTypeModule)],
    controllers: [PersonalChargeController],
    providers: [PersonalChargeService],
    exports: [PersonalChargeService]
})
export class PersonalChargeModule {
}
