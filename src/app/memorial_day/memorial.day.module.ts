import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {MemorialDayController} from './memorial.day.controller';
import {MemorialDay} from '../../db/entities/MemorialDay';
import {MemorialDayService} from './memorial.day.service';

@Module({
    imports: [TypeOrmModule.forFeature([MemorialDay])],
    controllers: [MemorialDayController],
    providers: [MemorialDayService],
    exports: [MemorialDayService]
})
export class MemorialDayModule {
}
