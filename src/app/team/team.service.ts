import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect} from 'typeorm';
import {v4 as uuidV4} from 'uuid';
import {Team} from '../../db/entities/Team';
import {ResponseResult} from '../../types/result.interface';
import {isNickname} from '../../utils/validate';
import {UserService} from '../user/user.service';

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,  // 使用泛型注入对应类型的存储库实例
        private readonly usersService: UserService
    ) {
    }

    /**
     * 创建
     *
     * @param team Team 实体对象
     */
    async createTeam(team: Team): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: 200, message: '创建成功'};
        // 校验用户信息
        if (!team.name) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }
        const teamExistName = await this.teamRepo.findOne({
            where: {
                name: team.name
            }
        });
        if (teamExistName) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '团队/家庭名已存在';
            return responseBody;
        }
        if (!isNickname(team.name)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '团队/家庭名只能为中文、数字、大小写英文和下划线，且在12位以内';
            return responseBody;
        }
        // 插入数据时，删除 id，以避免请求体内传入 id
        team.id !== null && team.id !== undefined && delete team.id;
        // 初始化 user
        // status
        team.status = 1;
        // primary_key with uuid
        team.primary_key = uuidV4().toString();
        // members_num
        team.members_num = 1;

        await this.teamRepo.save(team);

        // 更新用户信息
        const user = await this.usersService.findOneById(team.owner);
        user.team_id = team.id;
        user.team_name = team.name;
        await this.usersService.updateUser(user.id, user);

        responseBody.code = HttpStatus.CREATED;
        responseBody.message = '创建成功';

        return responseBody;

    }

    /**
     * 添加成员
     *
     * @param id ID
     * @param nickname nickname
     * */
    async addMember(id: number, nickname: string): Promise<ResponseResult> {
        let responseBody = {code: 200, message: '邀请成功'};
        const user = await this.usersService.findOneByNickname(nickname);
        const team = await this.findOneById(id)
        if (!nickname) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '用户昵称不能为空';
        } else if (!user) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '用户不存在';
        } else if (user.team_id) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '该用户已在团队/家庭内';
        } else {
            user.team_id = team.id;
            user.team_name = team.name;
            team.members_num += 1;
            const members = team.members.split(',');
            members.push(String(user.id));
            team.members = members.join(',');
            await this.teamRepo.update(team.id, team);
            await this.usersService.updateUser(user.id, user);
        }
        return responseBody;
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deleteTeam(id: number): Promise<void> {
        await this.findOneById(id);
        await this.teamRepo.delete(id);
    }

    /**
     * 更新
     *
     * @param id ID
     * @param team Team 实体对象
     */
    async updateTeam(id: number, team: Team): Promise<void> {
        await this.findOneById(id);
        // 更新数据时，删除 id，以避免请求体内传入 id
        team.id !== null && team.id !== undefined && delete team.id;
        await this.teamRepo.update(id, team);
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOneTeamById(id: number): Promise<ResponseResult> {
        const teamFind = await this.findOneById(id, {
            name: true,
            primary_key: true,
            members_num: true,
            id: true,
            members: true,
            owner: true
        });
        const userIds = teamFind.members.split(',')
        const users = await this.usersService.findManyByIds(userIds.map(id=>Number(id)))
        return teamFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: {
                    ...teamFind,
                    members_detail: users
                }
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '团队/家庭不存在'
            };
    }

    /**
     * 根据 name 查询
     *
     * @param name 根据 name 查询
     */
    async findOneTeamByName(name: string): Promise<ResponseResult> {
        const userFind = await this.findOneByName(name, {
            name: true,
            primary_key: true,
            members_num: true,
            id: true
        });
        return userFind ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: userFind
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '用户不存在'
            };
    }

    /**
     * 根据ID查询单个信息，如果不存在则抛出404异常
     * @param id ID
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<Team>): Promise<Team | undefined> {
        return await this.teamRepo.findOne({where: {id}, select});
    }

    /**
     * 根据 owner 查询单个信息，如果不存在则抛出404异常
     * @param owner owner
     * @param select select conditions
     */
    public async findOneByOwner(owner: number, select?: FindOptionsSelect<Team>): Promise<Team | undefined> {
        return await this.teamRepo.findOne({where: {owner}, select});
    }

    /**
     * 根据 name 查询单个信息，如果不存在则抛出404异常
     * @param name name
     @param select select conditions
     */
    public async findOneByName(name: string, select?: FindOptionsSelect<Team>): Promise<Team | undefined> {
        return await this.teamRepo.findOne({where: {name}, select});
    }
}