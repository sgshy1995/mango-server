import { HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "../../app/user/user.service";
import { JwtService } from '@nestjs/jwt';
import { encryptPassword } from '../../utils/cryptogram';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {}

  // JWT验证 - Step 2: 校验用户信息
  async validateUser(username: string, password: string): Promise<any> {
    console.log('JWT验证 - Step 2: 校验用户信息');
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const hashedPassword = user.password;
      const salt = user.salt;
      // 通过密码盐，加密传参，再与数据库里的比较，判断是否相等
      const hashPassword = encryptPassword(password, salt);
      if (hashedPassword === hashPassword) {
        // 密码正确
        console.log('密碼正確')
        return {
          code: 1,
          user
        };
      } else {
        // 密码错误
        console.log('密碼錯誤')
        return {
          code: 2,
          user: null
        };
      }
    }
    // 查无此人
    console.log('查無此人')
    return {
      code: 3,
      user: null
    };
  }

  // JWT验证 - Step 3: 处理 jwt 签证
  async certificate(user: any) {
    const payload = { username: user.username, sub: user.id, nickname: user.nickname, primary_key: user.primary_key };
    console.log('JWT验证 - Step 3: 处理 jwt 签证');
    console.log('payload',payload)
    try {
      const token = this.jwtService.sign(payload);
      return {
        code: HttpStatus.OK,
        data: {
          token,
        },
        message: `登录成功`,
      };
    } catch (error) {
      console.log('error',error)
      return {
        code: HttpStatus.BAD_REQUEST,
        message: `账号或密码错误`,
      };
    }
  }
}
