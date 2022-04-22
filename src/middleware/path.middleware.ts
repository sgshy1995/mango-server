import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import fs = require('fs')
import path = require('path')
import {PathLike} from 'fs';
import moment = require("moment");

@Injectable()
export class PathMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        function createDirIfNotExist(dir_path:PathLike) {
            if (!fs.existsSync(dir_path)) {
                fs.mkdirSync(dir_path,{recursive:true});
            }
        }
        createDirIfNotExist(path.join(process.env.UPLOAD_PATH,`/users/${moment(new Date(),'YYYY-MM-DD').utcOffset(8).format('YYYY-MM-DD')}`))
        createDirIfNotExist(path.join(process.env.UPLOAD_PATH,`/infos/background/${moment(new Date(),'YYYY-MM-DD').utcOffset(8).format('YYYY-MM-DD')}`))
        createDirIfNotExist(path.join(process.env.UPLOAD_PATH,`/infos/avatar/${moment(new Date(),'YYYY-MM-DD').utcOffset(8).format('YYYY-MM-DD')}`))
        next();
    }
}