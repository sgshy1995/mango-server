/**
* 用户名
* @param s
* */
export function isUsername(s: string) {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s) && s.length<=18;
}

/**
 * 昵称
 * @param s
 * */
export function isNickname(s: string){
    return /^[\u4e00-\u9fa5A-Za-z0-9-_]*$/.test(s) && s.length<=12
}

/**
 * 备注
 * @param s
 * */
export function isRemark(s: string){
    return /^[\u4e00-\u9fa5A-Za-z0-9-_]*$/.test(s) && s.length<=20
}

/**
* 密码
* 密码必须同时包含大写字母、小写字母、数字、特殊符号等四项中的至少三项正则表达式
* 20位
* @param s
* */
export function isPassword(s: string) {
    let num = 0;
    let hansCheck = false;
    if (/[0-9]/.test(s)) {
        console.log('数字校验通过');
        num++;
    }
    if (/[-.!@#$%^&*()+?><]/.test(s)) {
        console.log('字符校验通过');
        num++;
    }
    if (/[a-z]/.test(s)) {
        console.log('a-z校验通过');
        num++;
    }
    if (/[A-Z]/.test(s)) {
        console.log('A-Z校验通过');
        num++;
    }
    if(new RegExp("[\\u4E00-\\u9FFF]+","g").test(s)){
        console.log('错误 检验到汉字');
        hansCheck = true
    }
    return num >= 2 && !hansCheck && s.length <= 20;
}

/**
 * 邮箱
 * @param {*} s
 */
export function isEmail(s: string) {
    console.log('isEmail', /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(s), s);
    return /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(s);
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile(s: string) {
    return /^((13[0-9])|(14[5,7,9])|(15([0-3]|[5-9]))|(166)|(17[0,1,3,5,6,7,8])|(18[0-9])|(19[8|9|5]))\d{8}$|^0\d{2,3}-?\d{7,8}$/.test(s);
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone(s: string) {
    return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s);
}

/**
 * URL地址
 * @param {*} s
 */
export function isURL(s: string) {
    return /^http[s]?:\/\/.*/.test(s);
}

/**
 * 身份证
 * @param {*} s
 * */
export function isCard(s: string) {
    return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(s);
}

/**
 * 纯数字校验
 * @param {*} s
 * */
export function isIntNumber(s: string) {
    return /^[0-9]*$/.test(s);
}

/**
 * 数字校验包括小数
 * @param {*} s
 * */
export function isFloatNumber(s: string) {
    return /^\d+(.\d+)?$/.test(s);
}

/**
 * 是否包含中文 校验
 * @param {*} s
 * */
export function isChinese(s: string) {
    return /.*[\u4e00-\u9fa5]+.*/g.test(s);
}

/**
 * 是否全部为中文 校验
 * @param {*} s
 * */
export function isAllChinese(s: string) {
    return /^[\u4e00-\u9fa5]+$/g.test(s);
}

/**
 * 特殊字符 不包括 - _
 * @param {*} s
 * */
export function specialSting(s: string) {
    // return /[`~!@#_$%^&*()=|{}':;',\\\[\\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？\s]/g.test(s)
    return /[`~!@#$%^&*()=|{}':;',\\\[\\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？\s]/g.test(s);
}

/**
 * port
 * @param {*} s
 * */
export function isPort(s: string) {
    let strArr: string[] = [];
    let check = true;
    if (!s.toString().trim()) {
        return false;
    }
    s.toString().trim().split('\n').map(str => {
        str.split(',').map(strIn => {
            strArr = [...strArr, ...strIn.split('-')];
        });
    });
    strArr.map(str => {
        if (str) {
            const num = Number(str.trim());
            if (num < 0 || num > 65535 || (isNaN(num))) {
                check = false;
            }
        }
    });
    return check;
}

/**
 * ipv4
 * @param {*} s
 * */
export function isIpv4(s: string) {
    return /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(s);
}

/**
 * ipv6
 * @param {*} s
 * */
export function isIpv6(s: string) {
    return /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(s);
}

/**
 * host
 * @param {*} s String
 * @param protocol Boolean 是否需要补全协议，默认为是
 * @param both Boolean 是否忽略协议补全，默认为否；当为是时，自动忽略 protocol 参数
 * */
export function isHost(s: string, protocol: boolean = true, both: boolean = false) {
    return both ? (/^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(s) || /((([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(s)) : protocol ? /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(s) : /((([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(s);
}

/**
 *  字母 数字 汉字 特殊字符
 *  @param {*} s String
 */

export function isTemplate(s:string) {
    return /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$$/.test(s)
}

/**
 * 全版本支持的地址检查
 * */
export function isAllHostOrIp(s:string){
    return /^(http:\/\/|https:\/\/)?(((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}|(www.)?[^www.][a-z]+\.[a-z]+)(:\d+)?$/.test(s);
}
