import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect} from 'typeorm';
import {Info} from '../../db/entities/Info';
import {ResponseResult} from '../../types/result.interface';

@Injectable()
export class InfoService {
    constructor(
        @InjectRepository(Info) private readonly infoRepo: Repository<Info>
    ) {
    }

    /**
     * 创建
     *
     * @param info Info 实体对象
     */
    async createInfo(info: Info): Promise<void> {
        await this.infoRepo.save(info)
    }

    /**
     * 更新
     *
     * @param user_id user_id
     * @param info Info 实体对象
     */
    async updateInfoByUserId(user_id: number, info: Info): Promise<ResponseResult> {
        const infoFind = await this.infoRepo.findOne({
            where: {
                user_id
            }
        })
        await this.infoRepo.update(infoFind.id, info)
        return {
            code: HttpStatus.OK,
            message: '更新成功'
        }
    }

    /**
     * 根据 user_id 查询
     *
     * @param user_id user_id
     */
    async findOneInfoById(user_id: number): Promise<ResponseResult> {
        const infoFind = await this.findOneByUserId(user_id, {
            id: true,
            user_id: true,
            money_avatar: true,
            money_background: true
        });
        return infoFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: infoFind
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 根据 user_id 查询单个信息，如果不存在则抛出404异常
     * @param user_id user_id
     * @param select select conditions
     */
    public async findOneByUserId(user_id: number, select?: FindOptionsSelect<Info>): Promise<Info | undefined> {
        return await this.infoRepo.findOne({where: {user_id}, select});
    }

}