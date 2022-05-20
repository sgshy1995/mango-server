import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect} from 'typeorm';
import {Birthday} from '../../db/entities/Birthday';
import {ResponseResult} from '../../types/result.interface';
import {isNickname, isRemark} from '../../utils/validate';
import moment = require('moment');

@Injectable()
export class BirthdayService {
    constructor(
        @InjectRepository(Birthday) private readonly birthdayRepo: Repository<Birthday>
    ) {
    }

    /**
     * 创建
     *
     * @param birthday birthday 实体对象
     */
    async createBirthday(birthday: Birthday): Promise<ResponseResult> {
        let responseBody = {code: 200, message: '创建成功'};
        // 校验信息
        if (!birthday.name || !birthday.created_by || typeof birthday.is_lunar !== 'number' || typeof birthday.remind !== 'number') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }
        if (!isNickname(birthday.name)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '姓名只能为中文、数字、大小写英文和下划线，且在12位以内';
            return responseBody;
        }
        if (birthday.remark && !isRemark(birthday.remark)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '备注只能为中文、数字、大小写英文和下划线，且在20位以内';
            return responseBody;
        }
        // 插入数据时，删除 id，以避免请求体内传入 id
        birthday.id !== null && birthday.id !== undefined && delete birthday.id;
        // 初始化 birthday
        // status
        birthday.status = 1;
        await this.birthdayRepo.save(birthday);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id id
     * @param birthday birthday 实体对象
     */
    async updateBirthdayById(id: number, birthday: Birthday): Promise<ResponseResult> {
        const birthdayFind = await this.birthdayRepo.findOne({
            where: {
                id
            }
        });
        await this.birthdayRepo.update(birthdayFind.id, birthday);
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
    async deleteBirthdayById(id: number): Promise<ResponseResult> {
        const birthdayFind = await this.birthdayRepo.findOne({
            where: {
                id
            }
        });
        birthdayFind.status = 0;
        await this.birthdayRepo.update(birthdayFind.id, birthdayFind);
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
    async findOneBirthdayById(id: number): Promise<ResponseResult> {
        const birthdayFindFind = await this.findOneById(id, {
            id: true,
            name: true,
            remark: true,
            birthday: true,
            is_lunar: true,
            lunar_cn: true,
            lunar_year: true,
            lunar_month: true,
            lunar_day: true,
            status: true,
            remind: true,
            created_by: true
        });
        return birthdayFindFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: birthdayFindFind
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
    async findManyBirthdaysByCreatedBy(created_by: number): Promise<ResponseResult> {
        const birthdayFind = await this.findManyByCreatedBy(created_by, {
            id: true,
            name: true,
            remark: true,
            birthday: true,
            is_lunar: true,
            lunar_cn: true,
            lunar_year: true,
            lunar_month: true,
            lunar_day: true,
            status: true,
            remind: true,
            created_by: true
        });
        return birthdayFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: birthdayFind.map(item=>{
                    return {
                        ...item,
                        birthday: moment(new Date(item.birthday), 'YYYY-MM-DD').format('YYYY-MM-DD')
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
    public async findOneById(id: number, select?: FindOptionsSelect<Birthday>): Promise<Birthday | undefined> {
        return await this.birthdayRepo.findOne({where: {id}, select});
    }

    /**
     * 根据 created_by 查询单个信息，如果不存在则抛出404异常
     * @param created_by created_by
     * @param select select conditions
     */
    public async findManyByCreatedBy(created_by: number, select?: FindOptionsSelect<Birthday>): Promise<Birthday[] | undefined> {
        return await this.birthdayRepo.find({
            where: {created_by, status: 1},
            order: {
                created_at: {
                    direction: 'asc'
                }
            },
            select
        });
    }

}
