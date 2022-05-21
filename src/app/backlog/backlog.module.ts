import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BacklogController} from './backlog.controller';
import {Backlog} from '../../db/entities/Backlog';
import {BacklogService} from './backlog.service';

@Module({
    imports: [TypeOrmModule.forFeature([Backlog])],
    controllers: [BacklogController],
    providers: [BacklogService],
    exports: [BacklogService]
})
export class BacklogModule {
}
