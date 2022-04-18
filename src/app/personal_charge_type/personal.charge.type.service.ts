// noinspection DuplicatedCode

import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect, Between} from 'typeorm';
import {PersonalChargeType} from '../../db/entities/PersonalChargeType';
import {ResponseResult} from '../../types/result.interface';
import {UserService} from '../user/user.service';
import {PersonalChargeService} from '../personal_charge/personal.charge.service';
import {v4 as uuidV4} from 'uuid';

@Injectable()
export class PersonalChargeTypeService {
    constructor(
        @InjectRepository(PersonalChargeType) private readonly personalChargeTypeRepo: Repository<PersonalChargeType>,  // 使用泛型注入对应类型的存储库实例
        private readonly usersService: UserService,
        private readonly personalChargeService: PersonalChargeService
    ) {
    }

    /**
     * 创建
     *
     * @param personalChargeType personalChargeType 实体对象
     */
    async createPersonalChargeType(personalChargeType: PersonalChargeType): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '创建成功'};

        // 校验输入信息
        if (!personalChargeType.name || !personalChargeType.icon || typeof personalChargeType.created_by !== 'number' || typeof personalChargeType.balance_type !== 'number') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }

        // 校验用户信息
        const user = await this.usersService.findOneById(personalChargeType.created_by);
        if (!user) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '用户不存在';
            return responseBody;
        }

        // 校验 name 信息
        const nameFind = await this.findOneByName(personalChargeType.name, personalChargeType.created_by) || await this.findOneByName(personalChargeType.name, 0);
        if (nameFind) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '分类已存在';
            return responseBody;
        }

        // 校验数量信息
        const readyFind =  await this.findManyByCreatedBy(personalChargeType.created_by);
        if (readyFind && readyFind.length >= 20) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '最多添加20个分类';
            return responseBody;
        }

        // 插入数据时，删除 id，以避免请求体内传入 id
        personalChargeType.hasOwnProperty('id') && delete personalChargeType.id;
        // status
        personalChargeType.status = 1;
        // realname
        personalChargeType.realname = uuidV4().toString();
        // created_type
        personalChargeType.created_type = 'custom';

        await this.personalChargeTypeRepo.save(personalChargeType);

        responseBody.code = HttpStatus.CREATED;

        return responseBody;
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deletePersonalCharge(id: number): Promise<ResponseResult> {
        const personalChargeType = await this.findOneById(id);
        let responseBody = {code: HttpStatus.OK, message: '删除成功'};
        if (!personalChargeType) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        if (personalChargeType.created_type === 'default') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '默认记录不可删除';
            return responseBody;
        }
        personalChargeType.status = 0;
        // 同步删除所有记录
        const personalCharges = await this.personalChargeService.findManyByChargeType(personalChargeType.realname, personalChargeType.created_by);
        await Promise.all(
            personalCharges.map(async (item) => {
                item.status = 0;
                return await this.personalChargeService.updatePersonalCharge(item.id, item.charge_num, item.remark, item.status);
            })
        );
        // 更新数据时，删除 id，以避免请求体内传入 id
        personalChargeType.hasOwnProperty('id') && delete personalChargeType.id;
        await this.personalChargeTypeRepo.update(id, personalChargeType);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id ID
     * @param name name 名称
     * @param icon icon 图标
     */
    async updatePersonalChargeType(id: number, name: string, icon: string): Promise<ResponseResult> {
        let responseBody = {code: HttpStatus.OK, message: '更新成功'};
        const personalChargeType = await this.findOneById(id);
        if (!personalChargeType) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        if (!name || !icon) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }
        // 校验 name 信息
        const nameFind = await this.findOneByName(name, personalChargeType.created_by) || await this.findOneByName(name, 0);
        if (nameFind && nameFind.id !== personalChargeType.id) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '分类已存在';
            return responseBody;
        }
        // 只允许更新 name 和 icon
        personalChargeType.hasOwnProperty('id') && delete personalChargeType.id;
        personalChargeType.name = name;
        personalChargeType.icon = icon;

        await this.personalChargeTypeRepo.update(id, personalChargeType);
        return responseBody;
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOnePersonalChargeTypeById(id: number): Promise<ResponseResult> {
        const personalChargeType = await this.findOneById(id, {
            id: true,
            created_by: true,
            created_type: true,
            icon: true,
            balance_type: true,
            created_at: true,
            name: true,
            realname: true
        });
        return personalChargeType ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: personalChargeType
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 多路查询
     *
     * @param findOptions PersonalChargeType
     */

    async findManyPersonalChargeTypes(findOptions: PersonalChargeType): Promise<ResponseResult> {
        const selectOptions = {
            id: true,
            created_by: true,
            created_type: true,
            icon: true,
            balance_type: true,
            created_at: true,
            name: true,
            realname: true
        };
        const personalChargeTypes = await this.findMany(findOptions, selectOptions);
        return {
            code: HttpStatus.OK,
            message: '查询成功',
            data: personalChargeTypes
        };
    }

    /**
     * 根据ID查询单个信息，如果不存在则抛出404异常
     * @param id ID
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<PersonalChargeType>): Promise<PersonalChargeType | undefined> {
        return await this.personalChargeTypeRepo.findOne({where: {id, status: 1}, select});
    }

    /**
     * 根据name查询单个信息，如果不存在则抛出404异常
     * @param name name
     * @param created_by created_by
     * @param select select conditions
     */
    public async findOneByName(name: string, created_by?: number, select?: FindOptionsSelect<PersonalChargeType>): Promise<PersonalChargeType | undefined> {
        return await this.personalChargeTypeRepo.findOne({where: {name, created_by, status: 1}, select});
    }

    /**
     * 根据 create_by 查询多个信息，如果不存在则抛出404异常
     * @param created_by created_by
     @param select select conditions
     */
    public async findManyByCreatedBy(created_by: number, select?: FindOptionsSelect<PersonalChargeType>): Promise<PersonalChargeType[] | undefined> {
        return await this.personalChargeTypeRepo.find({
            where: {created_by, status: 1}, order: {
                id: {
                    direction: 'asc'
                }
            }, select
        });
    }

    /**
     * 根据参数查询多个信息，如果不存在则抛出404异常
     * @param findOptions findOptions
     @param select select conditions
     */
    public async findMany(findOptions: PersonalChargeType, select?: FindOptionsSelect<PersonalChargeType>): Promise<PersonalChargeType[] | undefined> {
        const personalChargeTypesFind = await this.personalChargeTypeRepo.find({
            where: {
                ...findOptions,
                balance_type: findOptions.balance_type ? Number(findOptions.balance_type) : undefined,
                created_by: findOptions.created_by ? Number(findOptions.created_by) : undefined,
                status: 1
            }, order: {
                id: {
                    direction: 'asc'
                }
            }, select
        });
        const personalChargeTypesDefault = await this.personalChargeTypeRepo.find({
            where: {
                ...findOptions,
                balance_type: findOptions.balance_type ? Number(findOptions.balance_type) : undefined,
                created_by: 0,
                status: 1
            }, order: {
                id: {
                    direction: 'asc'
                }
            }, select
        });
        return personalChargeTypesDefault.concat(personalChargeTypesFind)
    }
}
