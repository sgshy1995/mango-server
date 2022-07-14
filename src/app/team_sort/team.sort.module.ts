import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {TeamSortController} from './team.sort.controller';
import {TeamSort} from '../../db/entities/TeamSort';
import {TeamSortService} from './team.sort.service';

import {TeamModule} from '../team/team.module';

@Module({
    imports: [TypeOrmModule.forFeature([TeamSort]), TeamModule],
    controllers: [TeamSortController],
    providers: [TeamSortService],
    exports: [TeamSortService]
})
export class TeamSortModule {
}
