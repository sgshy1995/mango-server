import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {InfoController} from './info.controller';
import {Info} from '../../db/entities/Info';
import {InfoService} from './info.service';

@Module({
    imports: [TypeOrmModule.forFeature([Info])],
    controllers: [InfoController],
    providers: [InfoService],
    exports: [InfoService]
})
export class InfoModule {
}