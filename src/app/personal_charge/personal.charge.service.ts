import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, FindOptionsSelect, Between} from 'typeorm';
import {PersonalCharge} from '../../db/entities/PersonalCharge';
import {ResponseResult} from '../../types/result.interface';
import {UserService} from '../user/user.service';
import moment = require('moment');
import {getWeeks} from '../../utils/getWeeks';

@Injectable()
export class PersonalChargeService {
    constructor(
        @InjectRepository(PersonalCharge) private readonly personalChargeRepo: Repository<PersonalCharge>,  // 使用泛型注入对应类型的存储库实例
        private readonly usersService: UserService
    ) {
    }

    /**
     * 创建
     *
     * @param personalCharge PersonalCharge 实体对象
     */
    async createPersonalCharge(personalCharge: PersonalCharge): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '创建成功'};

        // 校验输入信息
        if (!personalCharge.charge_num || !personalCharge.charge_type || !personalCharge.created_by || typeof personalCharge.charge_num !== 'number' || !personalCharge.charge_time) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }

        // 校验用户信息
        const user = await this.usersService.findOneById(personalCharge.created_by);
        if (!user) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '用户不存在';
            return responseBody;
        }

        // 插入数据时，删除 id，以避免请求体内传入 id
        personalCharge.id !== null && personalCharge.id !== undefined && delete personalCharge.id;
        // status
        personalCharge.status = 1;
        // charge_time
        personalCharge.charge_time = moment(personalCharge.charge_time, 'YYYY-MM-DD').format('YYYY-MM-DD') + ' 00:00:00';

        await this.personalChargeRepo.save(personalCharge);

        responseBody.code = HttpStatus.CREATED;

        return responseBody;
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deletePersonalCharge(id: number): Promise<ResponseResult> {
        const personalCharge = await this.findOneById(id);
        let responseBody = {code: HttpStatus.OK, message: '删除成功'};
        if (!personalCharge) {
            responseBody.code = HttpStatus.NOT_FOUND;
            responseBody.message = '记录不存在';
            return responseBody;
        }
        personalCharge.status = 0;
        // 更新数据时，删除 id，以避免请求体内传入 id
        personalCharge.id !== null && personalCharge.id !== undefined && delete personalCharge.id;
        await this.personalChargeRepo.update(id, personalCharge);
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
    async updatePersonalCharge(id: number, charge_num: number, remark: string, status?: number): Promise<ResponseResult> {
        let responseBody = {code: HttpStatus.OK, message: '更新成功'};
        const personalCharge = await this.findOneById(id);
        if (!personalCharge) {
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
        personalCharge.id !== null && personalCharge.id !== undefined && delete personalCharge.id;
        personalCharge.charge_num = charge_num;
        personalCharge.remark = remark;
        (status !== undefined && status !== null) ? personalCharge.status = status : null;

        await this.personalChargeRepo.update(id, personalCharge);
        return responseBody;
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOnePersonalChargeById(id: number): Promise<ResponseResult> {
        const personalCharge = await this.findOneById(id, {
            id: true,
            created_by: true,
            charge_type: true,
            balance_type: true,
            charge_time: true,
            charge_num: true,
            remark: true,
            created_at: true
        });
        return personalCharge ?
            {
                code: HttpStatus.OK,
                message: '查询成功',
                data: personalCharge
            } : {
                code: HttpStatus.NOT_FOUND,
                message: '记录不存在'
            };
    }

    /**
     * 多路查询
     *
     * @param findOptions Record<>
     */

    async findManyPersonalCharges(findOptions: PersonalCharge & { charge_time_range: string[] }): Promise<ResponseResult> {
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
            const personalCharges = await this.findMany(findOptions, {charge_time_range: findOptions.charge_time_range}, selectOptions);
            const summaryResult: { charge_type: string, money: number, balance_type: number }[] = [];
            personalCharges.map(item => {
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
                income: summaryResult.filter(item => item.balance_type).length ? Math.round(summaryResult.filter(item => item.balance_type).map(item => item.money).reduce((m, n) => m + n) * 100) / 100 : 0,
                spend: summaryResult.filter(item => !item.balance_type).length ? Math.round(summaryResult.filter(item => !item.balance_type).map(item => item.money).reduce((m, n) => m + n) * 100) / 100 : 0
            };
            return {
                code: HttpStatus.OK,
                message: '查询成功',
                data: {
                    result: personalCharges,
                    summary: {
                        items: summaryResult,
                        total
                    }
                }
            };
        }
    }

    /**
     * 多路查询
     * */
    async findManyChargesByTime(created_by: number, time_type: 'week' | 'month' | 'year', year: number, index: number): Promise<ResponseResult> {
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
        const personalCharges = await this.findManyByTime(created_by, time_type, year, index, selectOptions);
        return {
            code: HttpStatus.OK,
            message: '查询成功',
            data: personalCharges
        };
    }

    /**
     * 根据ID查询单个信息，如果不存在则抛出404异常
     * @param id ID
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<PersonalCharge>): Promise<PersonalCharge | undefined> {
        return await this.personalChargeRepo.findOne({where: {id, status: 1}, select});
    }

    /**
     * 根据参数查询多个信息，如果不存在则抛出404异常
     * @param findOptions findOptions
     * @param customFindOptions customFindOptions
     @param select select conditions
     */
    public async findMany(findOptions: PersonalCharge, customFindOptions?: { charge_time_range: string[] }, select?: FindOptionsSelect<PersonalCharge>): Promise<PersonalCharge[] | undefined> {
        return await this.personalChargeRepo.find({
            where: {
                status: 1,
                ...findOptions,
                charge_time: (customFindOptions && customFindOptions.charge_time_range && customFindOptions.charge_time_range.length && customFindOptions.charge_time_range.length === 2) ?
                    Between(customFindOptions.charge_time_range[0], customFindOptions.charge_time_range[1]) :
                    findOptions.charge_time ?
                        findOptions.charge_time : undefined
            }, order: {
                created_at: {
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
    public async findManyByCreatedBy(created_by: number, select?: FindOptionsSelect<PersonalCharge>): Promise<PersonalCharge[] | undefined> {
        return await this.personalChargeRepo.find({where: {created_by, status: 1}, select});
    }

    /**
     * 根据 charge_type 查询多个信息，如果不存在则抛出404异常
     * @param charge_type charge_type
     * @param created_by created_by
     @param select select conditions
     */
    public async findManyByChargeType(charge_type: string, created_by: number, select?: FindOptionsSelect<PersonalCharge>): Promise<PersonalCharge[] | undefined> {
        return await this.personalChargeRepo.find({where: {charge_type, created_by, status: 1}, select});
    }

    /**
     * 根据 charge_time 查询多个信息，如果不存在则抛出404异常
     * @param charge_time charge_time
     * @param created_by created_by
     @param select select conditions
     */
    public async findManyByChargeTime(charge_time: string, created_by: number, select?: FindOptionsSelect<PersonalCharge>): Promise<PersonalCharge[] | undefined> {
        return await this.personalChargeRepo.find({where: {charge_time, created_by, status: 1}, select});
    }

    /**
     * 根据 charge_time_range 查询多个信息，如果不存在则抛出404异常
     * @param charge_time_range string[] charge_time_range
     @param select select conditions
     */
    public async findManyByChargeTimeRange(charge_time_range: string[], select?: FindOptionsSelect<PersonalCharge>): Promise<PersonalCharge[] | undefined> {
        return await this.personalChargeRepo.find({
            where: {
                charge_time: Between(charge_time_range[0], charge_time_range[1]),
                status: 1
            },
            select
        });
    }

    /**
     * 根据周/月/年 查询数据
     * @param created_by number 创建人
     * @param time_type 'week' | 'month' | 'year' 查询时间类型
     * @param year number 查询年份
     * @param index number 第几（只在周或月条件下生效）
     * @param select select conditions
     * */
    public async findManyByTime(created_by: number, time_type: 'week' | 'month' | 'year', year: number, index: number, select?: FindOptionsSelect<PersonalCharge>) {
        type ResultItem = {
            times: string[]
            spend: number[]
            income: number[]
            balance_type?: number
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
                const weekInfo = getWeeks([year])[year.toString()][index.toString()];
                const weekShowInfo = ['1', '2', '3', '4', '5', '6', '7'];
                await Promise.all(weekInfo.days.map((day, indexIn) => {
                    return new Promise(async (resolve, reject) => {
                        const findTime = moment(`${day} 00:00:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                        const showTime = weekShowInfo[indexIn];
                        if (findTime && findTime.indexOf('Invalid') <= -1) {
                            findResult[showTime] = await this.findManyByChargeTime(findTime, created_by, select);
                        }
                        resolve('ready');
                    });
                }));
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
                            findResult[showTime] = await this.findManyByChargeTime(findTime, created_by, select);
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
                            created_by
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
                times: time_type === 'week' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] : sortKeys,
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
                showResults.total.income[indexIn] = Math.round(showResults.total.income[indexIn] * 100) / 100
                showResults.total.spend[indexIn] = Math.round(showResults.total.spend[indexIn] * 100) / 100
                // items 是否存在该类型的记录
                if (showResults.items.hasOwnProperty(item.charge_type)) {
                    if (showResults.items[item.charge_type].times[indexIn] === null || showResults.items[item.charge_type].times[indexIn] === undefined) showResults.items[item.charge_type].times[indexIn] = date;
                    if (showResults.items[item.charge_type].income[indexIn] === null || showResults.items[item.charge_type].income[indexIn] === undefined) showResults.items[item.charge_type].income[indexIn] = 0;
                    if (showResults.items[item.charge_type].spend[indexIn] === null || showResults.items[item.charge_type].spend[indexIn] === undefined) showResults.items[item.charge_type].spend[indexIn] = 0;
                    item.balance_type ? showResults.items[item.charge_type].income[indexIn] += item.charge_num : showResults.items[item.charge_type].spend[indexIn] += item.charge_num;
                } else {
                    showResults.items[item.charge_type] = {
                        times: time_type === 'week' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] : sortKeys,
                        spend: generateZeroArray(sortKeys.length),
                        income: generateZeroArray(sortKeys.length),
                        balance_type: item.balance_type
                    };
                    item.balance_type ? showResults.items[item.charge_type].income[indexIn] += item.charge_num : showResults.items[item.charge_type].spend[indexIn] += item.charge_num;
                }
                showResults.items[item.charge_type].income[indexIn] = Math.round(showResults.items[item.charge_type].income[indexIn] * 100) / 100
                showResults.items[item.charge_type].spend[indexIn] = Math.round(showResults.items[item.charge_type].spend[indexIn] * 100) / 100
            });
        });
        return showResults;
    }
}
