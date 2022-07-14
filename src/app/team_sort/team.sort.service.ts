// noinspection DuplicatedCode

import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect} from 'typeorm';
import {TeamSort} from '../../db/entities/TeamSort';
import {ResponseResult} from '../../types/result.interface';
import {TeamService} from '../team/team.service';

@Injectable()
export class TeamSortService {
    constructor(
        @InjectRepository(TeamSort) private readonly teamSortRepo: Repository<TeamSort>,  // 使用泛型注入对应类型的存储库实例
        private readonly teamService: TeamService
    ) {
    }

    /**
     * 创建
     *
     * @param teamSort teamSort 实体对象
     */
    async createTeamSort(teamSort: TeamSort): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '创建成功'};

        // 校验团队信息
        const team = await this.teamService.findOneById(teamSort.team_id);
        if (!team) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '团队不存在';
            return responseBody;
        }

        // 插入数据时，删除 id，以避免请求体内传入 id
        teamSort.hasOwnProperty('id') && delete teamSort.id;
        teamSort.hasOwnProperty('created_at') && delete teamSort.created_at;
        teamSort.hasOwnProperty('updated_at') && delete teamSort.updated_at;
        // status
        teamSort.status = 1;

        await this.teamSortRepo.save(teamSort);

        responseBody.code = HttpStatus.CREATED;

        return responseBody;
    }

    /**
     * 更新排序
     *
     * @param team_id team_id 创建者
     * @param balance_type balance_type 收支类型
     * @param origin_id origin_id 初始id
     * @param move_id move_id 移动后的id
     */
    async updateTeamSortByUser(team_id: number, balance_type: number, origin_id: number, move_id: number): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '操作成功'};

        // 校验团队信息
        const team = await this.teamService.findOneById(team_id);
        if (!team) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '团队不存在';
            return responseBody;
        }

        // 提取 id 信息
        const teamSort = await this.findOneByTeamIdAndBalanceType(team_id, balance_type);
        const ids = teamSort.types_ids_sort.split(',');
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
        teamSort.types_ids_sort = ids.join()
        await this.teamSortRepo.update(teamSort.id, teamSort)
        return responseBody;
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deleteTeamSort(id: number): Promise<ResponseResult> {
        const teamSort = await this.findOneById(id);
        let responseBody = {code: HttpStatus.OK, message: '删除成功'};
        if (!teamSort) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        teamSort.status = 0;
        // 更新数据时，删除 id，以避免请求体内传入 id
        teamSort.hasOwnProperty('id') && delete teamSort.id;
        await this.teamSortRepo.update(id, teamSort);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id ID
     * @param types_ids_sort types_ids_sort 名称
     */
    async updateTeamSort(id: number, types_ids_sort: string): Promise<ResponseResult> {
        let responseBody = {code: HttpStatus.OK, message: '更新成功'};
        const teamSort = await this.findOneById(id);
        if (!teamSort) {
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
        teamSort.hasOwnProperty('id') && delete teamSort.id;
        teamSort.types_ids_sort = types_ids_sort;

        await this.teamSortRepo.update(id, teamSort);
        return responseBody;
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOneTeamSortById(id: number): Promise<ResponseResult> {
        const teamSort = await this.findOneById(id, {
            id: true,
            types_ids_sort: true,
            team_id: true,
            status: true,
            created_at: true,
            updated_at: true
        });
        return teamSort ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: teamSort
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
    public async findOneById(id: number, select?: FindOptionsSelect<TeamSort>): Promise<TeamSort | undefined> {
        return await this.teamSortRepo.findOne({where: {id, status: 1}, select});
    }

    /**
     * 根据team_id查询单个信息，如果不存在则抛出404异常
     * @param team_id team_id
     * @param select select conditions
     */
    public async findOneByTeamId(team_id: number, select?: FindOptionsSelect<TeamSort>): Promise<TeamSort | undefined> {
        return await this.teamSortRepo.findOne({where: {team_id, status: 1}, select});
    }

    /**
     * 根据team_id查询单个信息，如果不存在则抛出404异常
     * @param team_id team_id
     * @param balance_type balance_type
     * @param select select conditions
     */
    public async findOneByTeamIdAndBalanceType(team_id: number, balance_type: number, select?: FindOptionsSelect<TeamSort>): Promise<TeamSort | undefined> {
        return await this.teamSortRepo.findOne({where: {team_id, balance_type, status: 1}, select});
    }
}
