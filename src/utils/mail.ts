import * as nodemailer from 'nodemailer';
import mailConfig from '../config/mail.config';

/**
 * 邮箱发送验证码
 * @param code 验证码 | string
 * @param send_to 目标邮箱地址 | string
 * */
async function mail(code: string, send_to: string) {
    // 如果你没有一个真实邮箱的话可以使用该方法创建一个测试邮箱

    return new Promise(async (resolve, reject) => {
        await nodemailer.createTestAccount();

        // 创建Nodemailer传输器 SMTP 或者 其他 运输机制
        const transporter = nodemailer.createTransport({
            host: mailConfig().host, // 第三方邮箱的主机地址
            port: mailConfig().port,
            secure: true, // true for 465, false for other ports
            auth: {
                user: mailConfig().user, // 发送方邮箱的账号
                pass: mailConfig().pass, // 邮箱授权密码
            },
        });

        // 定义transport对象并发送邮件
        transporter.sendMail({
            from: `"懒比蛋生活" <${mailConfig().user}>`, // 发送方邮箱的账号
            to: send_to, // 邮箱接受者的账号
            subject: '邮箱验证码', // Subject line
            html: `欢迎注册「懒比蛋生活」, 您的邮箱验证码是: <br/><br/><b style="font-size: 16px">${code}</b><br/><br/><span style="font-size: 10px">请勿泄露验证码；如果你没有注册过「懒比蛋生活」，请忽略本邮件。</span><br/><br/><span style="font-size: 10px">我是「懒比蛋生活」智能机器人邮箱账号，请勿回复本邮件，有问题请发送邮件至<a href="mailto:support@eden-life.net.cn">support@eden-life.net.cn</a>。</span>`, // html 内容, 如果设置了html内容, 将忽略text内容
        }).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        });
    });

}

export default mail;
