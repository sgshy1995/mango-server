import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {FindOptionsSelect, FindOptionsWhere, getRepository, Repository} from 'typeorm';
import {v4 as uuidV4} from 'uuid';
import {User} from '../../db/entities/User';
import {ResponseResult} from '../../types/result.interface';
import {isEmail, isMobile, isNickname, isPassword, isUsername} from '../../utils/validate';
import {encryptPassword, makeSalt} from '../../utils/cryptogram';
import {InfoService} from '../info/info.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,  // 使用泛型注入对应类型的存储库实例
        private readonly infoService: InfoService
    ) {
    }

    /**
     * 创建
     *
     * @param user User 实体对象
     */
    async createUser(user: User & {private_yard?: string}): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody = {code: HttpStatus.OK, message: '创建成功'};
        // 校验用户信息
        if (!user.username || !user.nickname || !user.password || !user.private_yard) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '参数错误';
            return responseBody;
        }

        // 格式校验
        if (!isUsername(user.username)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '用户名只能为数字、大小写英文和下划线，且在18位以内';
            return responseBody;
        }
        if (!isNickname(user.nickname)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '昵称只能为中文、数字、大小写英文和下划线，且在12位以内';
            return responseBody;
        }
        if (!isPassword(user.password)) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '密码必须同时包含大写字母、小写字母、数字、特殊符号等四项中的至少两项，且在20位以内';
            return responseBody;
        }

        // 内测码验证
        if (user.private_yard !== process.env.PRIVATE_YARD){
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '内测码错误';
            return responseBody;
        }

        const userInfoExistUsername = await this.userRepo.findOne({
            where: {
                username: user.username
            }
        });
        if (userInfoExistUsername) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '用户名已存在';
            return responseBody;
        }
        const userInfoExistNickname = await this.userRepo.findOne({
            where: {
                nickname: user.nickname
            }
        });
        if (userInfoExistNickname) {
            responseBody.code = HttpStatus.CONFLICT;
            responseBody.message = '昵称已存在';
            return responseBody;
        }
        // 处理密码
        const salt = makeSalt(); // 制作密码盐
        user.password = encryptPassword(user.password, salt);  // 加密密码
        user.salt = salt;
        // 插入数据时，删除 id，以避免请求体内传入 id
        user.id !== null && user.id !== undefined && delete user.id;
        // 初始化 user
        // status
        user.status = 1;
        // primary_key with uuid
        user.primary_key = uuidV4().toString();

        responseBody.code = HttpStatus.CREATED;
        responseBody.message = '注册成功';

        await this.userRepo.save(user);

        // @ts-ignore
        await this.infoService.createInfo({
            user_id: user.id
        })

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
    async updateUser(id: number, user: User): Promise<ResponseResult> {
        let responseBody = {code: HttpStatus.OK, message: '更新成功'};
        if (!id){
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '用户ID不能为空';
            return responseBody;
        }
        let userFind = await this.findOneById(id);
        if (!userFind){
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '用户不存在';
            return responseBody;
        }
        // 更新数据时，删除 id，以避免请求体内传入 id
        user.id !== null && user.id !== undefined && delete user.id;
        // 校验 nickname
        if (user.hasOwnProperty('nickname')){
            if (!user.nickname){
                responseBody.code = HttpStatus.BAD_REQUEST;
                responseBody.message = '昵称不能为空';
                return responseBody;
            }
            if (!isNickname(user.nickname)){
                responseBody.code = HttpStatus.BAD_REQUEST;
                responseBody.message = '昵称只能为中文、数字、大小写英文和下划线，且在12位以内';
                return responseBody;
            }
            const userNicknameExist =  await this.findOneByNickname(user.nickname);
            if (userNicknameExist){
                responseBody.code = HttpStatus.CONFLICT;
                responseBody.message = '昵称已存在';
                return responseBody;
            }
        }
        // 校验 email
        if (user.hasOwnProperty('email')){
            if (!user.email){
                responseBody.code = HttpStatus.BAD_REQUEST;
                responseBody.message = '邮箱不能为空';
                return responseBody;
            }
            if (!isEmail(user.email)){
                responseBody.code = HttpStatus.BAD_REQUEST;
                responseBody.message = '请输入正确格式的邮箱';
                return responseBody;
            }
            const userEmailExist =  await this.findOneByAny({email: user.email});
            if (userEmailExist){
                responseBody.code = HttpStatus.CONFLICT;
                responseBody.message = '邮箱已被注册';
                return responseBody;
            }
        }
        // 校验 phone
        if (user.hasOwnProperty('phone')){
            if (!user.phone){
                responseBody.code = HttpStatus.BAD_REQUEST;
                responseBody.message = '手机号不能为空';
                return responseBody;
            }
            if (!isMobile(user.phone)){
                responseBody.code = HttpStatus.BAD_REQUEST;
                responseBody.message = '请输入正确格式的手机号';
                return responseBody;
            }
            const userPhoneExist =  await this.findOneByAny({phone: user.phone});
            if (user.phone && userPhoneExist){
                responseBody.code = HttpStatus.CONFLICT;
                responseBody.message = '手机号已被注册';
                return responseBody;
            }
        }
        userFind = Object.assign(userFind, user)
        await this.userRepo.update(id, userFind);
        return responseBody;
    }

    /**
     * 根据ID查询
     *
     * @param id ID
     */
    async findOneUserById(id: number): Promise<ResponseResult> {
        const userFind = await this.findOneById(id, {
            username: true,
            primary_key: true,
            nickname: true,
            avatar: true,
            phone: true,
            email: true,
            id: true,
            team_id: true,
            team_name: true,
            gender: true,
            birthday: true
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
     * 根据 username 查询
     *
     * @param username 根据 username 查询
     */
    async findOneUserByUsername(username: string): Promise<ResponseResult> {
        const userFind = await this.findOneByUsername(username, {
            username: true,
            primary_key: true,
            nickname: true,
            avatar: true,
            phone: true,
            email: true,
            id: true,
            team_id: true,
            team_name: true,
            gender: true,
            birthday: true
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
     * 根据 ID 查询单个信息，如果不存在则抛出404异常
     * @param id ID
     * @param select select conditions
     */
    public async findOneById(id: number, select?: FindOptionsSelect<User>): Promise<User | undefined> {
        return await this.userRepo.findOne({where: {id}, select});
    }

    /**
     * 根据 ids 查询单个信息，如果不存在则抛出404异常
     * @param ids ids
     * @param select select conditions
     */
    public async findManyByIds(ids: number[], select?: FindOptionsSelect<User>): Promise<User[] | undefined> {
        return await getRepository(User)
            .createQueryBuilder('user')
            .select(['user.id', 'user.username', 'user.avatar', 'user.nickname'])
            .where('user.id IN (:...ids)', {ids})
            .orderBy('user.id')
            .getMany();
    }

    /**
     * 根据 username 查询单个信息，如果不存在则抛出404异常
     * @param username username
     @param select select conditions
     */
    public async findOneByUsername(username: string, select?: FindOptionsSelect<User>): Promise<User | undefined> {
        return await this.userRepo.findOne({where: {username}, select});
    }

    /**
     * 根据 nickname 查询单个信息，如果不存在则抛出404异常
     * @param nickname nickname
     @param select select conditions
     */
    public async findOneByNickname(nickname: string, select?: FindOptionsSelect<User>): Promise<User | undefined> {
        return await this.userRepo.findOne({where: {nickname}, select});
    }

    /**
     * 根据 custom 查询单个信息，如果不存在则抛出404异常
     * @param custom any
     @param select select conditions
     */
    public async findOneByAny(custom: FindOptionsWhere<User>, select?: FindOptionsSelect<User>): Promise<User | undefined> {
        return await this.userRepo.findOne({where: custom, select});
    }
}