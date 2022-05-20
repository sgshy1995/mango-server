import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BirthdayController} from './birthday.controller';
import {Birthday} from '../../db/entities/Birthday';
import {BirthdayService} from './birthday.service';

@Module({
    imports: [TypeOrmModule.forFeature([Birthday])],
    controllers: [BirthdayController],
    providers: [BirthdayService],
    exports: [BirthdayService]
})
export class BirthdayModule {
}
