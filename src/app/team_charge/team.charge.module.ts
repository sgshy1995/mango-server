import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {TeamChargeController} from './team.charge.controller';
import {TeamCharge} from '../../db/entities/TeamCharge';
import {TeamChargeService} from './team.charge.service';

import {UserModule} from '../user/user.module';
import {TeamModule} from '../team/team.module';

@Module({
    imports: [TypeOrmModule.forFeature([TeamCharge]), UserModule, TeamModule],
    controllers: [TeamChargeController],
    providers: [TeamChargeService],
    exports: [TeamChargeService]
})
export class TeamChargeModule {
}