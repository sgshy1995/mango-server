// 定义通用的API接口返回数据类型
export interface ResponseResult {
    code: number;
    message: string;
    data?: any;
}