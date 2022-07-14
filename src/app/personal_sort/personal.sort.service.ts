// noinspection DuplicatedCode

import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect} from 'typeorm';
import {PersonalSort} from '../../db/entities/PersonalSort';
import {ResponseResult} from '../../types/result.interface';
import {UserService} from '../user/user.service';

@Injectable()
export class PersonalSortService {
    constructor(
        @InjectRepository(PersonalSort) private readonly personalSortRepo: Repository<PersonalSort>,  // 使用泛型注入对应类型的存储库实例
        private readonly usersService: UserService
    ) {
    }

    /**
     * 创建
     *
     * @param personalSort personalSort 实体对象
     */
    async createPersonalSort(personalSort: PersonalSort): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '创建成功'};

        // 校验用户信息
        const user = await this.usersService.findOneById(personalSort.created_by);
        if (!user) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '用户不存在';
            return responseBody;
        }

        // 插入数据时，删除 id，以避免请求体内传入 id
        personalSort.hasOwnProperty('id') && delete personalSort.id;
        personalSort.hasOwnProperty('created_at') && delete personalSort.created_at;
        personalSort.hasOwnProperty('updated_at') && delete personalSort.updated_at;
        // status
        personalSort.status = 1;

        await this.personalSortRepo.save(personalSort);

        responseBody.code = HttpStatus.CREATED;

        return responseBody;
    }

    /**
     * 更新排序
     *
     * @param created_by created_by 创建者
     * @param balance_type balance_type 收支类型
     * @param origin_id origin_id 初始id
     * @param move_id move_id 移动后的id
     */
    async updatePersonalSortByUser(created_by: number, balance_type: number, origin_id: number, move_id: number): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '操作成功'};

        // 校验用户信息
        const user = await this.usersService.findOneById(created_by);
        if (!user) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '用户不存在';
            return responseBody;
        }

        // 提取 id 信息
        const personalSort = await this.findOneByCreatedByAndBalanceType(created_by, balance_type);
        const ids = personalSort.types_ids_sort.split(',');
        if (!ids.length) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '没有排序记录';
            return responseBody;
        }
        // 获取源index，置为undefined
        const origin_index = ids.findIndex(id => id === origin_id.toString());
        ids[origin_index] = undefined
        // 获取目标index，插入
        const move_index = ids.findIndex(id => id === move_id.toString());
        ids.splice(move_index + 1, 0, String(origin_id))
        // 获取值为undefined的index，删除
        const undefined_index = ids.findIndex(id => id === undefined);
        ids.splice(undefined_index, 1)
        // 保存
        personalSort.types_ids_sort = ids.join()
        await this.personalSortRepo.update(personalSort.id, personalSort)
        return responseBody;
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deletePersonalSort(id: number): Promise<ResponseResult> {
        const personalSort = await this.findOneById(id);
        let responseBody = {code: HttpStatus.OK, message: '删除成功'};
        if (!personalSort) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        personalSort.status = 0;
        // 更新数据时，删除 id，以避免请求体内传入 id
        personalSort.hasOwnProperty('id') && delete personalSort.id;
        await this.personalSortRepo.update(id, personalSort);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id ID
     * @param types_ids_sort types_ids_sort 名称
     */
    async updatePersonalSort(id: number, types_ids_sort: string): Promise<ResponseResult> {
        let responseBody = {code: HttpStatus.OK, message: '更新成功'};
        const personalSort = await this.findOneById(id);
        if (!personalSort) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        if (!types_ids_sort) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }
        // 只允许更新 name 和 icon
        personalSort.hasOwnProperty('id') && delete personalSort.id;
        personalSort.types_ids_sort = types_ids_sort;

        await this.personalSortRepo.update(id, personalSort);
        return responseBody;
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOnePersonalSortById(id: number): Promise<ResponseResult> {
        const personalSort = await this.findOneById(id, {
            id: true,
            types_ids_sort: true,
            created_by: true,
            status: true,
            created_at: true,
            updated_at: true
        });
        return personalSort ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: personalSort
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 根据ID查询单个信息，如果不存在则抛出404异常
     * @param id ID
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<PersonalSort>): Promise<PersonalSort | undefined> {
        return await this.personalSortRepo.findOne({where: {id, status: 1}, select});
    }

    /**
     * 根据created_by查询单个信息，如果不存在则抛出404异常
     * @param created_by created_by
     * @param select select conditions
     */
    public async findOneByCreatedBy(created_by: number, select?: FindOptionsSelect<PersonalSort>): Promise<PersonalSort | undefined> {
        return await this.personalSortRepo.findOne({where: {created_by, status: 1}, select});
    }

    /**
     * 根据created_by查询单个信息，如果不存在则抛出404异常
     * @param created_by created_by
     * @param balance_type balance_type
     * @param select select conditions
     */
    public async findOneByCreatedByAndBalanceType(created_by: number, balance_type: number, select?: FindOptionsSelect<PersonalSort>): Promise<PersonalSort | undefined> {
        return await this.personalSortRepo.findOne({where: {created_by, balance_type, status: 1}, select});
    }
}
