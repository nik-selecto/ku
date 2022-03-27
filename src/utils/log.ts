import moment from 'moment';

export function log(...data: Record<string, any>[]) {
    console.info('----', moment().format('hh:mm:ss:SSS'), '----');
    data.forEach((d) => {
        Object.entries(d).forEach(([k, v]) => {
            console.info(`${k}:`, v);
        });
    });
    console.info('---------------------------------------------');
}
