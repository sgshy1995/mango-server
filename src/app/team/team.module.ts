import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {TeamController} from './team.controller';
import {Team} from '../../db/entities/Team';
import {TeamService} from './team.service';

import {UserModule} from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Team]), UserModule],
    controllers: [TeamController],
    providers: [TeamService],
    exports: [TeamService]
})
export class TeamModule {
}