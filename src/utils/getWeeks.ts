import moment = require('moment');

type WeekMap = Record<string, Record<string, { from: string, to: string, days: string[] }>>
export const getWeeks = (years: number[]): WeekMap => {
    let weeksMap: WeekMap = {};
    years.map(year => {
        const d = new Date(year, 0, 1);
        while (d.getDay() != 1) {
            d.setDate(d.getDate() + 1);
        }
        const to = new Date(year + 1, 0, 1);
        let i = 1;
        weeksMap[year.toString()] = {};
        for (let from = d; from < to;) {
            weeksMap[year.toString()][i.toString()] = {
                from: '',
                to: '',
                days: []
            };
            weeksMap[year.toString()][i.toString()].from = moment(`${year.toString()}-${from.getMonth() + 1}-${from.getDate()}`,'YYYY-MM-DD').format('YYYY-MM-DD');
            const historyFrom = from.getDate();
            from.setDate(from.getDate() + 6);

            if (from < to) {
                from.setDate(from.getDate() + 1);
                weeksMap[year.toString()][i.toString()].to = moment(`${year.toString()}-${from.getMonth() + 1}-${from.getDate()}`,'YYYY-MM-DD').format('YYYY-MM-DD');
            } else {
                // 最后一周
                to.setDate(to.getDate() - 1);

                if (to.getDate() - historyFrom < 7) {
                    weeksMap[year.toString()][i.toString()].to = moment(`${(year + 1).toString()}-01-0${7 - (to.getDate() - historyFrom + 1)}`,'YYYY-MM-DD').format('YYYY-MM-DD');
                } else {
                    weeksMap[year.toString()][i.toString()].to = moment(`${year.toString()}-${to.getMonth() + 1}-${to.getDate()}`, 'YYYY-MM-DD').format('YYYY-MM-DD');
                }

            }
            // 统计出每周的每一天
            weeksMap[year.toString()][i.toString()].days = [
                weeksMap[year.toString()][i.toString()].from,
                moment(new Date(new Date(weeksMap[year.toString()][i.toString()].from).setDate(new Date(weeksMap[year.toString()][i.toString()].from).getDate() + 1)), 'YYYY-MM-DD').format('YYYY-MM-DD'),
                moment(new Date(new Date(weeksMap[year.toString()][i.toString()].from).setDate(new Date(weeksMap[year.toString()][i.toString()].from).getDate() + 2)), 'YYYY-MM-DD').format('YYYY-MM-DD'),
                moment(new Date(new Date(weeksMap[year.toString()][i.toString()].from).setDate(new Date(weeksMap[year.toString()][i.toString()].from).getDate() + 3)), 'YYYY-MM-DD').format('YYYY-MM-DD'),
                moment(new Date(new Date(weeksMap[year.toString()][i.toString()].from).setDate(new Date(weeksMap[year.toString()][i.toString()].from).getDate() + 4)), 'YYYY-MM-DD').format('YYYY-MM-DD'),
                moment(new Date(new Date(weeksMap[year.toString()][i.toString()].from).setDate(new Date(weeksMap[year.toString()][i.toString()].from).getDate() + 5)), 'YYYY-MM-DD').format('YYYY-MM-DD'),
                moment(new Date(new Date(weeksMap[year.toString()][i.toString()].from).setDate(new Date(weeksMap[year.toString()][i.toString()].from).getDate() + 6)), 'YYYY-MM-DD').format('YYYY-MM-DD'),
            ];
            // 更正 to date
            weeksMap[year.toString()][i.toString()].to = moment(new Date(new Date(weeksMap[year.toString()][i.toString()].from).setDate(new Date(weeksMap[year.toString()][i.toString()].from).getDate() + 6)), 'YYYY-MM-DD').format('YYYY-MM-DD')
            // i++
            i++;
        }

    });

    return weeksMap;
};