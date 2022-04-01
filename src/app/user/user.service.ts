import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {v4 as uuidV4} from 'uuid';
import {User} from '../../db/entities/User';
import {ResponseResult} from '../../types/result.interface';
import {isNickname, isPassword, isUsername} from '../../utils/validate';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,  // 使用泛型注入对应类型的存储库实例
    ) {
    }

    /**
     * 创建
     *
     * @param user User 实体对象
     */
    async createUser(user: User): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = { code: 200, message: '创建成功' }
        // 校验用户信息
        const userInfoExistUsername = await this.userRepo.findOne({
                where: {
                    username: user.username
                }
            });
        if (userInfoExistUsername) {
            responseBody.code = HttpStatus.CONFLICT
            responseBody.message = '用户名已存在'
            return responseBody
        }
        const userInfoExistNickname = await this.userRepo.findOne({
            where: {
                nickname: user.nickname
            }
        });
        if (userInfoExistNickname) {
            responseBody.code = HttpStatus.CONFLICT
            responseBody.message = '用户昵称已存在'
            return responseBody
        }
        if (!isUsername(user.username)){
            responseBody.code = HttpStatus.BAD_REQUEST
            responseBody.message = '用户名非法或超出长度限制'
            return responseBody
        }
        if (!isNickname(user.nickname)){
            responseBody.code = HttpStatus.BAD_REQUEST
            responseBody.message = '用户昵称非法或超出长度限制'
            return responseBody
        }
        if (!isPassword(user.password)){
            responseBody.code = HttpStatus.BAD_REQUEST
            responseBody.message = '密码必须同时包含大写字母、小写字母、数字、特殊符号等四项中的至少三项，且在20位以内'
            return responseBody
        }
        // 插入数据时，删除 id，以避免请求体内传入 id
        user.id !== null && user.id !== undefined && delete user.id;
        // 初始化 user
        // status
        user.status = 1;
        // primary_key with uuid
        user.primary_key = uuidV4().toString();

        responseBody.code = HttpStatus.CREATED
        responseBody.message = '注册成功'

        await this.userRepo.save(user)

        return responseBody;

        /**
         * 将给定实体插入数据库。与save方法不同，执行原始操作时不包括级联，关系和其他操作。
         * 执行快速有效的INSERT操作。不检查数据库中是否存在实体，因此如果插入重复实体，本次操作将失败。
         */
        // await this.catRepo.insert(cat);
    }

    /**
     * 删除
     *
     * @param id ID
     */
    async deleteUser(id: number): Promise<void> {
        await this.findOneById(id);
        await this.userRepo.delete(id);
    }

    /**
     * 更新
     *
     * @param id ID
     * @param user User 实体对象
     */
    async updateCat(id: number, user: User): Promise<void> {
        await this.findOneById(id);
        // 更新数据时，删除 id，以避免请求体内传入 id
        user.id !== null && user.id !== undefined && delete user.id;
        await this.userRepo.update(id, user);
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOneUser(id: number): Promise<User> {
        return this.findOneById(id);
    }

    /**
     * 根据ID查询单个信息，如果不存在则抛出404异常
     * @param id ID
     */
    private async findOneById(id: number): Promise<User> {
        const userInfo = await this.userRepo.findOne({
            where: {
                id
            }
        });
        if (!userInfo) {
            throw new HttpException(`指定id的用户不存在`, 500);
        }
        return userInfo;
    }
}