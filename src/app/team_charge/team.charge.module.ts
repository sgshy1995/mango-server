import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {TeamChargeController} from './team.charge.controller';
import {TeamCharge} from '../../db/entities/TeamCharge';
import {TeamChargeService} from './team.charge.service';

import {UserModule} from '../user/user.module';
import {TeamModule} from '../team/team.module';

import {TeamChargeTypeModule} from '../team_charge_type/team.charge.type.module';

@Module({
    imports: [TypeOrmModule.forFeature([TeamCharge]), UserModule, TeamModule, forwardRef(() => TeamChargeTypeModule)],
    controllers: [TeamChargeController],
    providers: [TeamChargeService],
    exports: [TeamChargeService]
})
export class TeamChargeModule {
}
