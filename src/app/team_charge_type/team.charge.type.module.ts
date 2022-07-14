import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {TeamChargeTypeController} from './team.charge.type.controller';
import {TeamChargeType} from '../../db/entities/TeamChargeType';
import {TeamChargeTypeService} from './team.charge.type.service';

import {UserModule} from '../user/user.module';
import {TeamChargeModule} from '../team_charge/team.charge.module';
import {TeamModule} from '../team/team.module';
import {TeamSortModule} from '../team_sort/team.sort.module';

@Module({
    imports: [TypeOrmModule.forFeature([TeamChargeType]), UserModule, TeamChargeModule, TeamModule, TeamSortModule],
    controllers: [TeamChargeTypeController],
    providers: [TeamChargeTypeService],
    exports: [TeamChargeTypeService]
})
export class TeamChargeTypeModule {
}
