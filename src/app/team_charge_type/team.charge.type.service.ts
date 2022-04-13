import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect, Between} from 'typeorm';
import {TeamChargeType} from '../../db/entities/TeamChargeType';
import {ResponseResult} from '../../types/result.interface';
import {UserService} from '../user/user.service';
import {TeamService} from '../team/team.service';
import {TeamChargeService} from '../team_charge/team.charge.service';
import {v4 as uuidV4} from 'uuid';

@Injectable()
export class TeamChargeTypeService {
    constructor(
        @InjectRepository(TeamChargeType) private readonly teamChargeTypeRepo: Repository<TeamChargeType>,  // 使用泛型注入对应类型的存储库实例
        private readonly usersService: UserService,
        private readonly teamService: TeamService,
        private readonly teamChargeService: TeamChargeService
    ) {
    }

    /**
     * 创建
     *
     * @param teamChargeType teamChargeType 实体对象
     */
    async createTeamChargeType(teamChargeType: TeamChargeType): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '创建成功'};

        // 校验输入信息
        if (!teamChargeType.name || !teamChargeType.icon || typeof teamChargeType.created_by !== 'number' || typeof teamChargeType.balance_type !== 'number' || typeof teamChargeType.team_id !== 'number') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }

        // 校验用户信息
        const user = await this.usersService.findOneById(teamChargeType.created_by);
        if (!user || !user.status) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '用户不存在';
            return responseBody;
        }

        // 校验团队信息
        const team = await this.teamService.findOneById(teamChargeType.team_id);
        if (!team || !team.status) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '团队/家庭不存在';
            return responseBody;
        }

        // 校验 name 信息
        const nameFind = await this.findOneByName(teamChargeType.name,teamChargeType.team_id)
        if (nameFind) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '分类已存在';
            return responseBody;
        }

        // 插入数据时，删除 id，以避免请求体内传入 id
        teamChargeType.hasOwnProperty('id') && delete teamChargeType.id;
        // status
        teamChargeType.status = 1;
        // realname
        teamChargeType.realname = uuidV4().toString();
        // created_type
        teamChargeType.created_type = 'custom';

        await this.teamChargeTypeRepo.save(teamChargeType);

        responseBody.code = HttpStatus.CREATED;

        return responseBody;
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deleteTeamCharge(id: number): Promise<ResponseResult> {
        const teamChargeType = await this.findOneById(id);
        let responseBody = {code: HttpStatus.OK, message: '删除成功'};
        if (!teamChargeType) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        if (teamChargeType.created_type === 'default') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '默认记录不可删除';
            return responseBody;
        }
        teamChargeType.status = 0;
        // 同步删除所有记录
        const teamCharges = await this.teamChargeService.findManyByTeamId(teamChargeType.team_id);
        await Promise.all(
            teamCharges.map(async (item)=>{
                item.status = 0;
                return await this.teamChargeService.updateTeamCharge(item.id,item.charge_num,item.remark);
            })
        )
        // 更新数据时，删除 id，以避免请求体内传入 id
        teamChargeType.hasOwnProperty('id') && delete teamChargeType.id;
        await this.teamChargeTypeRepo.update(id, teamChargeType);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id ID
     * @param name name 名称
     * @param icon icon 图标
     */
    async updateTeamChargeType(id: number, name: string, icon: string): Promise<ResponseResult> {
        let responseBody = {code: HttpStatus.OK, message: '更新成功'};
        const teamChargeType = await this.findOneById(id);
        if (!teamChargeType) {
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
        const nameFind = await this.findOneByName(teamChargeType.name,teamChargeType.team_id)
        if (nameFind) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '分类已存在';
            return responseBody;
        }
        // 只允许更新 name 和 icon
        teamChargeType.hasOwnProperty('id') && delete teamChargeType.id;
        teamChargeType.name = name;
        teamChargeType.icon = icon;

        await this.teamChargeTypeRepo.update(id, teamChargeType);
        return responseBody;
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOneTeamChargeTypeById(id: number): Promise<ResponseResult> {
        const teamChargeType = await this.findOneById(id, {
            id: true,
            created_by: true,
            created_type: true,
            icon: true,
            balance_type: true,
            created_at: true,
            name: true,
            realname: true,
            team_id: true
        });
        return teamChargeType ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: teamChargeType
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 多路查询
     *
     * @param findOptions TeamChargeType
     */

    async findManyTeamChargeTypes(findOptions: TeamChargeType): Promise<ResponseResult> {
        const selectOptions = {
            id: true,
            created_by: true,
            created_type: true,
            icon: true,
            balance_type: true,
            created_at: true,
            name: true,
            realname: true,
            team_id: true
        };
        const teamChargeTypes = await this.findMany(findOptions, selectOptions);
        return {
            code: HttpStatus.OK,
            message: '查询成功',
            data: teamChargeTypes
        };
    }

    /**
     * 根据ID查询单个信息，如果不存在则抛出404异常
     * @param id ID
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<TeamChargeType>): Promise<TeamChargeType | undefined> {
        return await this.teamChargeTypeRepo.findOne({where: {id, status: 1}, select});
    }

    /**
     * 根据name查询单个信息，如果不存在则抛出404异常
     * @param name name
     * @param team_id team_id
     * @param select select conditions
     */
    public async findOneByName(name: string, team_id: number, select?: FindOptionsSelect<TeamChargeType>): Promise<TeamChargeType | undefined> {
        return await this.teamChargeTypeRepo.findOne({where: {name, team_id, status: 1}, select});
    }

    /**
     * 根据 team_id 查询多个信息，如果不存在则抛出404异常
     * @param team_id team_id
     @param select select conditions
     */
    public async findManyByTeamId(team_id: number, select?: FindOptionsSelect<TeamChargeType>): Promise<TeamChargeType[] | undefined> {
        return await this.teamChargeTypeRepo.find({where: {team_id, status: 1}, order: {
                created_at: {
                    direction: 'asc'
                }
            }, select});
    }

    /**
     * 根据参数查询多个信息，如果不存在则抛出404异常
     * @param findOptions findOptions
     @param select select conditions
     */
    public async findMany(findOptions: TeamChargeType, select?: FindOptionsSelect<TeamChargeType>): Promise<TeamChargeType[] | undefined> {
        const teamChargeTypesFind = await this.teamChargeTypeRepo.find({
            where: {
                ...findOptions,
                balance_type: findOptions.balance_type ? Number(findOptions.balance_type) : undefined,
                created_by: findOptions.created_by ? Number(findOptions.created_by) : undefined,
                team_id: findOptions.team_id ? Number(findOptions.team_id) : undefined,
                status: 1
            }, order: {
                created_at: {
                    direction: 'asc'
                }
            }, select
        });
        const teamChargeTypesDefault = await this.teamChargeTypeRepo.find({
            where: {
                ...findOptions,
                balance_type: findOptions.balance_type ? Number(findOptions.balance_type) : undefined,
                created_by: 0,
                team_id: 0,
                status: 1
            }, order: {
                created_at: {
                    direction: 'asc'
                }
            }, select
        });
        return teamChargeTypesDefault.concat(teamChargeTypesFind)
    }
}