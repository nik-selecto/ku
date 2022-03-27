import moment from 'moment';

export function devLog(data: Record<string, any>, title: string = 'devLog') {
    console.info('>>>', moment().format('hh:mm:ss:SSS'), title);
    console.info();

    console.info(JSON.parse(JSON.stringify(data)));

    console.info();
    console.info();
}
