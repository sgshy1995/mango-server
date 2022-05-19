import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect} from 'typeorm';
import {MemorialDay} from '../../db/entities/MemorialDay';
import {ResponseResult} from '../../types/result.interface';
import {isNickname, isRemark} from '../../utils/validate';
import moment = require('moment');

@Injectable()
export class MemorialDayService {
    constructor(
        @InjectRepository(MemorialDay) private readonly memorialDayRepo: Repository<MemorialDay>
    ) {
    }

    /**
     * 创建
     *
     * @param memorialDay memorialDay 实体对象
     */
    async createMemorialDay(memorialDay: MemorialDay): Promise<ResponseResult> {
        let responseBody = {code: 200, message: '创建成功'};
        // 校验信息
        if (!memorialDay.memorial_name || !memorialDay.created_by || !memorialDay.memorial_day || typeof memorialDay.remind !== 'number') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }
        if (!isNickname(memorialDay.memorial_name)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '纪念日名只能为中文、数字、大小写英文和下划线，且在12位以内';
            return responseBody;
        }
        if (memorialDay.memorial_remark && !isRemark(memorialDay.memorial_remark)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '纪念日备注只能为中文、数字、大小写英文和下划线，且在20位以内';
            return responseBody;
        }
        // 插入数据时，删除 id，以避免请求体内传入 id
        memorialDay.id !== null && memorialDay.id !== undefined && delete memorialDay.id;
        // 初始化 user
        // status
        memorialDay.status = 1;
        await this.memorialDayRepo.save(memorialDay);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id id
     * @param memorialDay memorialDay 实体对象
     */
    async updateMemorialDayById(id: number, memorialDay: MemorialDay): Promise<ResponseResult> {
        const memorialDayFind = await this.memorialDayRepo.findOne({
            where: {
                id
            }
        });
        await this.memorialDayRepo.update(memorialDayFind.id, memorialDay);
        return {
            code: HttpStatus.OK,
            message: '更新成功'
        };
    }

    /**
     * 删除
     *
     * @param id id
     */
    async deleteMemorialDayById(id: number): Promise<ResponseResult> {
        const memorialDayFind = await this.memorialDayRepo.findOne({
            where: {
                id
            }
        });
        memorialDayFind.status = 0;
        await this.memorialDayRepo.update(memorialDayFind.id, memorialDayFind);
        return {
            code: HttpStatus.OK,
            message: '删除成功'
        };
    }

    /**
     * 根据 id 查询
     *
     * @param id id
     */
    async findOneMemorialDayById(id: number): Promise<ResponseResult> {
        const memorialDayFind = await this.findOneById(id, {
            id: true,
            memorial_name: true,
            memorial_remark: true,
            memorial_day: true,
            status: true,
            remind: true,
            created_by: true
        });
        return memorialDayFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: memorialDayFind
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 根据 created_by 查询
     *
     * @param created_by created_by
     */
    async findManyMemorialDaysByCreatedBy(created_by: number): Promise<ResponseResult> {
        const memorialDayFind = await this.findManyByCreatedBy(created_by, {
            id: true,
            memorial_name: true,
            memorial_remark: true,
            memorial_day: true,
            status: true,
            remind: true,
            created_by: true
        });
        return memorialDayFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: memorialDayFind.map(item=>{
                    return {
                        ...item,
                        memorial_day: moment(new Date(item.memorial_day), 'YYYY-MM-DD').format('YYYY-MM-DD')
                    }
                })
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 根据 id 查询单个信息，如果不存在则抛出404异常
     * @param id id
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<MemorialDay>): Promise<MemorialDay | undefined> {
        return await this.memorialDayRepo.findOne({where: {id}, select});
    }

    /**
     * 根据 created_by 查询单个信息，如果不存在则抛出404异常
     * @param created_by created_by
     * @param select select conditions
     */
    public async findManyByCreatedBy(created_by: number, select?: FindOptionsSelect<MemorialDay>): Promise<MemorialDay[] | undefined> {
        return await this.memorialDayRepo.find({
            where: {created_by, status: 1},
            order: {
                memorial_day: {
                    direction: 'asc'
                }
            },
            select
        });
    }

}
