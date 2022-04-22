import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

//import { UserController } from './user.controller';
import {User} from '../../db/entities/User';
import {UserService} from './user.service';
import {InfoModule} from '../info/info.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), InfoModule],
    //controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {
}