import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {PersonalChargeTypeController} from './personal.charge.type.controller';
import {PersonalChargeType} from '../../db/entities/PersonalChargeType';
import {PersonalChargeTypeService} from './personal.charge.type.service';

import {UserModule} from '../user/user.module';
import {PersonalChargeModule} from '../personal_charge/personal.charge.module';

@Module({
    imports: [TypeOrmModule.forFeature([PersonalChargeType]), UserModule, PersonalChargeModule],
    controllers: [PersonalChargeTypeController],
    providers: [PersonalChargeTypeService],
    exports: [PersonalChargeTypeService]
})
export class PersonalChargeTypeModule {
}