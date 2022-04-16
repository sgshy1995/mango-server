// noinspection DuplicatedCode

import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect, Between} from 'typeorm';
import {TeamCharge} from '../../db/entities/TeamCharge';
import {ResponseResult} from '../../types/result.interface';
import {UserService} from '../user/user.service';
import {TeamService} from '../team/team.service';
import moment = require('moment');
import {PersonalCharge} from '../../db/entities/PersonalCharge';

@Injectable()
export class TeamChargeService {
    constructor(
        @InjectRepository(TeamCharge) private readonly teamChargeRepo: Repository<TeamCharge>,  // 使用泛型注入对应类型的存储库实例
        private readonly userService: UserService,
        private readonly teamService: TeamService
    ) {
    }

    /**
     * 创建
     *
     * @param teamCharge TeamCharge 实体对象
     */
    async createTeamCharge(teamCharge: TeamCharge): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '创建成功'};

        // 校验输入信息
        if (!teamCharge.charge_num || !teamCharge.charge_type || !teamCharge.created_by || !teamCharge.team_id || typeof teamCharge.charge_num !== 'number' || !teamCharge.charge_time) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }

        // 校验用户信息
        const user = await this.userService.findOneById(teamCharge.created_by);
        if (!user || !user.status) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '用户不存在';
            return responseBody;
        }

        // 校验团队信息
        const team = await this.teamService.findOneById(teamCharge.team_id);
        if (!team || !team.status) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '团队/家庭不存在';
            return responseBody;
        }

        // 插入数据时，删除 id，以避免请求体内传入 id
        teamCharge.id !== null && teamCharge.id !== undefined && delete teamCharge.id;
        // status
        teamCharge.status = 1;
        // charge_time
        teamCharge.charge_time = moment(teamCharge.charge_time, 'YYYY-MM-DD').format('YYYY-MM-DD') + ' 00:00:00';

        await this.teamChargeRepo.save(teamCharge);

        responseBody.code = HttpStatus.CREATED;

        return responseBody;
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deleteTeamCharge(id: number): Promise<ResponseResult> {
        const teamCharge = await this.findOneById(id);
        let responseBody = {code: HttpStatus.OK, message: '删除成功'};
        if (!teamCharge) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        teamCharge.status = 0;
        // 更新数据时，删除 id，以避免请求体内传入 id
        teamCharge.id !== null && teamCharge.id !== undefined && delete teamCharge.id;
        await this.teamChargeRepo.update(id, teamCharge);
        return responseBody;
    }

    /**
     * 更新
     *
     * @param id ID
     * @param charge_num charge_num 费用金额
     * @param remark remark 备注
     * @param status status 状态
     */
    async updateTeamCharge(id: number, charge_num: number, remark: string, status?: number): Promise<ResponseResult> {
        let responseBody = {code: HttpStatus.OK, message: '更新成功'};
        const teamCharge = await this.findOneById(id);
        if (!teamCharge) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        if (!charge_num || typeof charge_num !== 'number') {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }
        // 只允许更新 charge_num 和 remark
        teamCharge.id !== null && teamCharge.id !== undefined && delete teamCharge.id;
        teamCharge.charge_num = charge_num;
        teamCharge.remark = remark;
        (status !== undefined && status !== null) ? teamCharge.status = status : null;

        await this.teamChargeRepo.update(id, teamCharge);
        return responseBody;
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOneTeamChargeById(id: number): Promise<ResponseResult> {
        const teamCharge = await this.findOneById(id, {
            id: true,
            created_by: true,
            charge_type: true,
            balance_type: true,
            charge_time: true,
            charge_num: true,
            remark: true,
            created_at: true
        });
        return teamCharge ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: teamCharge
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 多路查询
     * */
    async findManyChargesByTime(team_id: number, time_type: 'week' | 'month' | 'year', year: number, index: number): Promise<ResponseResult> {
        const selectOptions = {
            id: true,
            created_by: true,
            charge_type: true,
            balance_type: true,
            charge_time: true,
            charge_num: true,
            remark: true,
            team_id: true,
            created_at: true
        };
        const personalCharges = await this.findManyByTime(team_id, time_type, year, index, selectOptions);
        return {
            code: HttpStatus.OK,
            message: '查询成功',
            data: personalCharges
        };
    }

    /**
     * 多路查询
     *
     * @param findOptions Record<>
     */

    async findManyTeamCharges(findOptions: TeamCharge & { charge_time_range: string[] }): Promise<ResponseResult> {
        console.log('findOptions', findOptions);
        let responseBody = {code: HttpStatus.OK, message: '查询成功'};
        const selectOptions = {
            id: true,
            created_by: true,
            charge_type: true,
            balance_type: true,
            charge_time: true,
            charge_num: true,
            remark: true,
            created_at: true
        };
        if (!findOptions || !Object.keys(findOptions).length) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
        } else {
            const teamCharges = await this.findMany(findOptions, {charge_time_range: findOptions.charge_time_range});
            const summaryResult: { charge_type: string, money: number, balance_type: number }[] = [];
            teamCharges.map(item => {
                if (!summaryResult.find(itemIn => itemIn.charge_type === item.charge_type)) {
                    const itemPush = {
                        charge_type: item.charge_type,
                        balance_type: item.balance_type,
                        money: 0
                    };

                    itemPush.money += item.charge_num;
                    summaryResult.push(itemPush);
                } else {
                    const itemFind = summaryResult.find(itemIn => itemIn.charge_type === item.charge_type);
                    itemFind.money += item.charge_num;
                }
            });

            const total = {
                income: summaryResult.filter(item => item.balance_type).length ? summaryResult.filter(item => item.balance_type).map(item => item.money).reduce((m, n) => m + n) : 0,
                spend: summaryResult.filter(item => !item.balance_type).length ? summaryResult.filter(item => !item.balance_type).map(item => item.money).reduce((m, n) => m + n) : 0
            };
            return {
                code: HttpStatus.OK,
                message: '查询成功',
                data: {
                    result: teamCharges,
                    summary: {
                        items: summaryResult,
                        total
                    }
                }
            };
        }
    }

    /**
     * 根据ID查询单个信息，如果不存在则抛出404异常
     * @param id ID
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<TeamCharge>): Promise<TeamCharge | undefined> {
        return await this.teamChargeRepo.findOne({where: {id, status: 1}, select});
    }

    /**
     * 根据参数查询多个信息，如果不存在则抛出404异常
     * @param findOptions findOptions
     * @param customFindOptions customFindOptions
     @param select select conditions
     */
    public async findMany(findOptions: TeamCharge, customFindOptions?: { charge_time_range: string[] }, select?: FindOptionsSelect<TeamCharge>): Promise<TeamCharge[] | undefined> {
        return await this.teamChargeRepo.find({
            where: {
                status: 1,
                ...findOptions,
                charge_time: (customFindOptions.charge_time_range && customFindOptions.charge_time_range.length && customFindOptions.charge_time_range.length === 2) ?
                    Between(customFindOptions.charge_time_range[0], customFindOptions.charge_time_range[1]) :
                    findOptions.charge_time ?
                        findOptions.charge_time : undefined
            }, order: {
                id: {
                    direction: 'asc'
                }
            }, select
        });
    }

    /**
     * 根据 create_by 查询多个信息，如果不存在则抛出404异常
     * @param created_by created_by
     @param select select conditions
     */
    public async findManyByCreatedBy(created_by: number, select?: FindOptionsSelect<TeamCharge>): Promise<TeamCharge[] | undefined> {
        return await this.teamChargeRepo.find({where: {created_by, status: 1}, select});
    }

    /**
     * 根据 team_id 查询多个信息，如果不存在则抛出404异常
     * @param team_id team_id
     @param select select conditions
     */
    public async findManyByTeamId(team_id: number, select?: FindOptionsSelect<TeamCharge>): Promise<TeamCharge[] | undefined> {
        return await this.teamChargeRepo.find({where: {team_id, status: 1}, order: {id: 'asc'}, select});
    }

    /**
     * 根据 charge_type 查询多个信息，如果不存在则抛出404异常
     * @param charge_type charge_type
     * @param team_id team_id
     @param select select conditions
     */
    public async findManyByChargeType(charge_type: string, team_id: number, select?: FindOptionsSelect<TeamCharge>): Promise<TeamCharge[] | undefined> {
        return await this.teamChargeRepo.find({where: {charge_type, team_id, status: 1}, select});
    }

    /**
     * 根据 charge_time 查询多个信息，如果不存在则抛出404异常
     * @param charge_time charge_time
     * @param team_id team_id
     @param select select conditions
     */
    public async findManyByChargeTime(charge_time: string, team_id: number, select?: FindOptionsSelect<TeamCharge>): Promise<TeamCharge[] | undefined> {
        return await this.teamChargeRepo.find({where: {charge_time, team_id, status: 1}, select});
    }

    /**
     * 根据 charge_time_range 查询多个信息，如果不存在则抛出404异常
     * @param charge_time_range string[] charge_time_range
     @param select select conditions
     */
    public async findManyByChargeTimeRange(charge_time_range: string[], select?: FindOptionsSelect<TeamCharge>): Promise<TeamCharge[] | undefined> {
        return await this.teamChargeRepo.find({
            where: {
                charge_time: Between(charge_time_range[0], charge_time_range[1]),
                status: 1
            },
            select
        });
    }

    /**
     * 根据周/月/年 查询数据
     * @param team_id number 团队/家庭
     * @param time_type 'week' | 'month' | 'year' 查询时间类型
     * @param year number 查询年份
     * @param index number 第几（只在周或月条件下生效）
     * @param select select conditions
     * */
    public async findManyByTime(team_id: number, time_type: 'week' | 'month' | 'year', year: number, index: number, select?: FindOptionsSelect<PersonalCharge>) {
        type ResultItem = {
            times: string[]
            spend: number[]
            income: number[]
        }

        // 生成指定长度的全部元素都为0的数组
        function generateZeroArray(length: number): number[] {
            const arr = [];
            for (let i = 0; i <= length; i++) {
                arr.push(0);
            }
            return arr;
        }

        const findResult: Record<string, PersonalCharge[]> = {};

        switch (time_type) {
            case 'week': {
                break;
            }

            case 'month': {
                const days = [];
                for (let i = 0; i <= 31; i++) {
                    days.push(i);
                }
                await Promise.all(days.map(i => {
                    return new Promise(async (resolve, reject) => {
                        const findTime = moment(`${year}-${index}-${i} 00:00:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                        const showTime = i.toString();
                        if (findTime && findTime.indexOf('Invalid') <= -1) {
                            findResult[showTime] = await this.findManyByChargeTime(findTime, team_id, select);
                        }
                        resolve('ready');
                    });
                }));
                break;
            }

            case 'year': {
                const daysList = [31, year / 4 ? 28 : 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                await Promise.all(daysList.map((num, indexIn) => {
                    return new Promise(async (resolve, reject) => {
                        const timeStart = moment(`${year}-${indexIn + 1}-1 00:00:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                        const timeEnd = moment(`${year}-${indexIn + 1}-${num} 00:00:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                        const showTime = (indexIn + 1).toString();
                        // @ts-ignore
                        findResult[showTime] = await this.findMany({
                            team_id
                        }, {charge_time_range: [timeStart, timeEnd]}, select);
                        resolve('ready');
                    });
                }));
                break;
            }
        }

        const sortKeys = Object.keys(findResult).sort((a, b) => {
            return time_type === 'week' ? new Date(a).getTime() - new Date(b).getTime() : new Date(a).getMonth() - new Date(b).getMonth();
        });
        const showResults: { total: ResultItem, items: Record<string, ResultItem> } = {
            total: {
                times: sortKeys,
                spend: generateZeroArray(sortKeys.length),
                income: generateZeroArray(sortKeys.length)
            },
            items: {}
        };
        sortKeys.forEach((date, indexIn) => {
            // 遍历每一个时间总记录
            findResult[date].forEach(item => {
                // 遍历每一个时间总记录中的一条记录
                // total
                item.balance_type ? showResults.total.income[indexIn] += item.charge_num : showResults.total.spend[indexIn] += item.charge_num;
                // items 是否存在该类型的记录
                if (showResults.items.hasOwnProperty(item.charge_type)) {
                    if (showResults.items[item.charge_type].times[indexIn] === null || showResults.items[item.charge_type].times[indexIn] === undefined) showResults.items[item.charge_type].times[indexIn] = date;
                    if (showResults.items[item.charge_type].income[indexIn] === null || showResults.items[item.charge_type].income[indexIn] === undefined) showResults.items[item.charge_type].income[indexIn] = 0;
                    if (showResults.items[item.charge_type].spend[indexIn] === null || showResults.items[item.charge_type].spend[indexIn] === undefined) showResults.items[item.charge_type].spend[indexIn] = 0;
                    item.balance_type ? showResults.items[item.charge_type].income[indexIn] += item.charge_num : showResults.items[item.charge_type].spend[indexIn] += item.charge_num;
                } else {
                    showResults.items[item.charge_type] = {
                        times: sortKeys,
                        spend: generateZeroArray(sortKeys.length),
                        income: generateZeroArray(sortKeys.length)
                    };
                    item.balance_type ? showResults.items[item.charge_type].income[indexIn] += item.charge_num : showResults.items[item.charge_type].spend[indexIn] += item.charge_num;
                }
            });
        });
        return showResults;
    }
}
