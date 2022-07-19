// noinspection DuplicatedCode

import {HttpStatus, Injectable} from '@nestjs/common';
import {ResponseResult} from '../../types/result.interface';

const axios = require('axios');
const cheerio = require('cheerio');

@Injectable()
export class AssistantService {

    /**
     * 根据省份查询油价
     *
     * @param province province 省份名称
     */
    async getGasInfoByProvince(province: string): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody: { code: number, message: string, data?: Record<string, any> } = {
            code: HttpStatus.OK,
            message: '查询成功',
            data: {
                gasInfo: {
                    province: '',
                    gas92: '',
                    gas95: '',
                    gas98: '',
                    gas0: ''
                },
                gasDynamicInfo: {
                    normal: '',
                    dynamic: ''
                }
            }
        };

        async function getGasHTML(): Promise<string> {
            // 获取所有城市信息
            let headersCity = {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                'Origin': 'www.qiyoujiage.com',
                'Host': 'www.qiyoujiage.com'
            };
            return new Promise((resolve, reject) => {
                axios
                    .get(
                        'http://www.qiyoujiage.com/',
                        {
                            headers: headersCity
                        }
                    )
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        console.log('err', err);
                        reject(err);
                    });
            });
        }

        try {
            const gasHTMLData = await getGasHTML();
            const $gas = cheerio.load(gasHTMLData);

            const gasList = [];

            $gas('ul.ylist > li').each(async function () {
                if (!$gas(this)) return;
                const liChooseClass = $gas(this).attr('class');
                if (liChooseClass === 't') {
                    const name = $gas(' > a', this).text();
                    const gas92 = ($gas(this).nextAll('li')[0] && $gas(this).nextAll('li')[0].children[0]) ? $gas(this).nextAll('li')[0].children[0].nodeValue.trim() : '';
                    const gas95 = ($gas(this).nextAll('li')[1] && $gas(this).nextAll('li')[1].children[0]) ? $gas(this).nextAll('li')[1].children[0].nodeValue.trim() : '';
                    const gas98 = ($gas(this).nextAll('li')[2] && $gas(this).nextAll('li')[2].children[0]) ? $gas(this).nextAll('li')[2].children[0].nodeValue.trim() : '';
                    const gas0 = ($gas(this).nextAll('li')[3] && $gas(this).nextAll('li')[3].children[0]) ? $gas(this).nextAll('li')[3].children[0].nodeValue.trim() : '';
                    gasList.push({
                        province: name,
                        gas92,
                        gas95,
                        gas98,
                        gas0
                    });
                }
            });

            if (gasList.find(item => item.province === province)) {
                responseBody.data.gasInfo = {...gasList.find(item => item.province === province)};
            }

            if ($gas('#all #left > div:first-child')) {
                responseBody.data.gasDynamicInfo.normal = $gas('#all #left > div:first-child').text().split('\n')[0];
                if ($gas('#all #left > div:first-child > span')) {
                    responseBody.data.gasDynamicInfo.dynamic = $gas('#all #left > div:first-child > span').text();
                    responseBody.data.gasDynamicInfo.normal = $gas('#all #left > div:first-child').text().split('\n')[0].split(responseBody.data.gasDynamicInfo.dynamic)[0];
                }
            }

        } catch (e) {
            responseBody.code = HttpStatus.BAD_REQUEST;
            responseBody.message = '请求失败';
            responseBody.data && delete responseBody.data;
        }

        return responseBody;
    }

    /**
     * 根据城市编码查询天气
     *
     * @param adcode adcode 城市编码
     */
    async getWeatherInfoByCity(adcode: string): Promise<ResponseResult> {
        /**
         * 创建新的实体实例，并将此对象的所有实体属性复制到新实体中。 请注意，它仅复制实体模型中存在的属性。
         */
        let responseBody: { code: number, message: string, data?: any } = {
            code: HttpStatus.OK,
            message: '查询成功',
            data: {}
        };

        async function getCityInfo(): Promise<Record<string, any>> {
            // 获取城市的天气信息
            let headersCity = {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
            };
            return new Promise((resolve, reject) => {
                axios
                    .get(
                        'https://geoapi.qweather.com/v2/city/lookup',
                        {
                            headers: headersCity,
                            params: {
                                key: 'f403334b3d82435f8dbb73a18f2d12dc',
                                location: adcode
                            }
                        }
                    )
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        console.log('err', err);
                        reject(err);
                    });
            });
        }

        async function getWeatherInfoNow(city_id: string): Promise<Record<string, any>> {
            // 获取城市的天气信息
            let headersCity = {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
            };
            return new Promise((resolve, reject) => {
                axios
                    .get(
                        'https://devapi.qweather.com/v7/weather/now',
                        {
                            headers: headersCity,
                            params: {
                                key: 'f403334b3d82435f8dbb73a18f2d12dc',
                                location: city_id
                            }
                        }
                    )
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        console.log('err', err);
                        reject(err);
                    });
            });
        }

        async function getWeatherInfoDaily(city_id: string): Promise<Record<string, any>> {
            // 获取城市的天气信息
            let headersCity = {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
            };
            return new Promise((resolve, reject) => {
                axios
                    .get(
                        'https://devapi.qweather.com/v7/weather/24h',
                        {
                            headers: headersCity,
                            params: {
                                key: '7b2a77cd702e417b925db4ead8c3ede9',
                                location: city_id
                            }
                        }
                    )
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        console.log('err', err);
                        reject(err);
                    });
            });
        }

        async function getWeatherInfo7d(city_id: string): Promise<Record<string, any>> {
            // 获取城市的天气信息
            let headersCity = {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
            };
            return new Promise((resolve, reject) => {
                axios
                    .get(
                        'https://devapi.qweather.com/v7/weather/7d',
                        {
                            headers: headersCity,
                            params: {
                                key: '7b2a77cd702e417b925db4ead8c3ede9',
                                location: city_id
                            }
                        }
                    )
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        console.log('err', err);
                        reject(err);
                    });
            });
        }

        try {
            const location = await getCityInfo();
            const locationInfo = (location.location && location.location[0]) ? location.location[0] : {}
            await Promise.all([
                getWeatherInfoNow(locationInfo.id),
                getWeatherInfoDaily(locationInfo.id),
                getWeatherInfo7d(locationInfo.id)
            ]).then(responses=>{
                const weather = responses[0];
                responseBody.data.now = weather.now ? weather.now : [];
                const daily = responses[1];
                responseBody.data.daily = daily.hourly ? daily.hourly : [];
                const d7 = responses[2];
                responseBody.data.d7 = d7.daily ? d7.daily : [];
            })
        } catch (e) {
            responseBody.data && delete responseBody.data;
            responseBody.message = e;
            responseBody.code = HttpStatus.BAD_REQUEST;
        }

        return responseBody;
    }

    /**
     * 获取所有城市编码
     */
    async getPCAList(): Promise<ResponseResult> {
        let responseBody: { code: number, message: string, data?: Record<string, any>[] } = {
            code: HttpStatus.OK,
            message: '查询成功',
            data: []
        };

        responseBody.data = require('../../../static/json/pca.json');

        return responseBody;
    }
}
