import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {PersonalSortController} from './personal.sort.controller';
import {PersonalSort} from '../../db/entities/PersonalSort';
import {PersonalSortService} from './personal.sort.service';

import {UserModule} from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([PersonalSort]), UserModule],
    controllers: [PersonalSortController],
    providers: [PersonalSortService],
    exports: [PersonalSortService]
})
export class PersonalSortModule {
}
