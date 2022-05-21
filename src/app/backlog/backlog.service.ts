import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect} from 'typeorm';
import {Backlog} from '../../db/entities/Backlog';
import {ResponseResult} from '../../types/result.interface';
import {isNickname} from '../../utils/validate';
import moment = require('moment');

@Injectable()
export class BacklogService {
    constructor(
        @InjectRepository(Backlog) private readonly backlogRepository: Repository<Backlog>
    ) {
    }

    /**
     * 创建
     *
     * @param backlog backlog 实体对象
     */
    async createBacklog(backlog: Backlog): Promise<ResponseResult> {
        let responseBody = {code: 200, message: '创建成功'};
        // 校验信息
        if (!backlog.name || !backlog.created_by || !backlog.backlog_day || typeof backlog.remind !== 'number' || typeof backlog.priority !== 'number') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }
        if (!isNickname(backlog.name)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '纪念日名只能为中文、数字、大小写英文和下划线，且在12位以内';
            return responseBody;
        }
        // 插入数据时，删除 id，以避免请求体内传入 id
        backlog.id !== null && backlog.id !== undefined && delete backlog.id;
        // 初始化 user
        // status
        backlog.status = 1;
        await this.backlogRepository.save(backlog);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id id
     * @param backlog backlog 实体对象
     */
    async updateBacklogById(id: number, backlog: Backlog): Promise<ResponseResult> {
        const backlogFind = await this.backlogRepository.findOne({
            where: {
                id
            }
        });
        await this.backlogRepository.update(backlogFind.id, backlog);
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
    async deleteBacklogById(id: number): Promise<ResponseResult> {
        const backlogFind = await this.backlogRepository.findOne({
            where: {
                id
            }
        });
        backlogFind.status = 0;
        await this.backlogRepository.update(backlogFind.id, backlogFind);
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
    async findOneBacklogById(id: number): Promise<ResponseResult> {
        const backlogFind = await this.findOneById(id, {
            id: true,
            name: true,
            remark: true,
            backlog_day: true,
            status: true,
            remind: true,
            priority: true,
            created_by: true
        });
        return backlogFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: backlogFind
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
    async findManyBacklogsByCreatedBy(created_by: number): Promise<ResponseResult> {
        const backlogFind = await this.findManyByCreatedBy(created_by, {
            id: true,
            name: true,
            remark: true,
            backlog_day: true,
            status: true,
            remind: true,
            priority: true,
            created_by: true
        });
        return backlogFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: backlogFind.map(item=>{
                    return {
                        ...item,
                        memorial_day: moment(new Date(item.backlog_day), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
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
    public async findOneById(id: number, select?: FindOptionsSelect<Backlog>): Promise<Backlog | undefined> {
        return await this.backlogRepository.findOne({where: {id}, select});
    }

    /**
     * 根据 created_by 查询单个信息，如果不存在则抛出404异常
     * @param created_by created_by
     * @param select select conditions
     */
    public async findManyByCreatedBy(created_by: number, select?: FindOptionsSelect<Backlog>): Promise<Backlog[] | undefined> {
        return await this.backlogRepository.find({
            where: {created_by, status: 1},
            order: {
                priority: {
                    direction: 'asc'
                }
            },
            select
        });
    }

}
