import crypto from 'crypto';
import moment from 'moment';
import QueryString from 'qs';
import { config } from 'dotenv';

config();

if (process.env.MODE === 'dev') {
    process.env.API_KEY = process.env.SANDBOX_API_KEY;
    process.env.API_SECRET = process.env.SANDBOX_API_SECRET;
    process.env.API_PASSPHRASE = process.env.SANDBOX_API_PASSPHRASE;
}
export class SignGenerator {
    public static create() {
        const { PASSPHRASE, API_KEY, API_SECRET } = process.env;

        return new SignGenerator(
            API_KEY,
            API_SECRET,
            PASSPHRASE,
        );
    }

    public generateHeaders(
        options: {
            method: 'GET' | 'POST',
            endpoint: string,
            params?: object,
            body?: object,
        },
    ) {
        const {
            method, endpoint, params, body,
        } = options;
        const _endpoint = params && Object.keys(params).length
            ? `${endpoint}?${QueryString.stringify(params).trim()}`
            : endpoint;
        const timestamp = moment().format('x');
        const stringToSign = this.stringToSign(_endpoint, timestamp, method, body);
        const signature = this.signature(stringToSign);
        const signedPassphrase = this.signature(this.passphrase);

        return {
            'KC-API-SIGN': signature,
            'KC-API-TIMESTAMP': timestamp,
            'KC-API-KEY': this.apiKey,
            'KC-API-PASSPHRASE': signedPassphrase,
            'KC-API-KEY-VERSION': '2',
            'Content-Type': 'application/json',
        };
    }

    private constructor(
        private apiKey: string,
        private apiSecret: string,
        private passphrase: string,
    ) { }

    private signature(payload: string) {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(payload)
            .digest('base64');
    }

    private stringToSign(
        endpoint: string,
        timestamp: string,
        method: 'GET' | 'POST',
        body?: object | string,
    ) {
        let _body: string | object = body ?? '';

        if (Object(body) === body) {
            _body = JSON.stringify(body);
        }

        const result = timestamp + method + endpoint + _body;

        return result;
    }
}
