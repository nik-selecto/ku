import axios from 'axios';
import { HOST } from '../constants';
import { SignGenerator } from './sign-generator.api';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class BaseMethod<TRes, TParams extends object = any, TBody extends object = any> {
    protected constructor(
      private method: 'GET' | 'POST',
      protected endpoint: string,
      protected params?: TParams,
      protected body?: TBody,
    ) { }

    public async exec() {
        const headers = SignGenerator
            .create()
            .generateHeaders(
                {
                    method: this.method,
                    endpoint: this.endpoint,
                    params: this.params,
                    body: this.body,
                },
            );

        const { data: axiosData } = await axios({
            headers,
            method: this.method,
            url: HOST + this.endpoint,
            params: this.params,
            data: this.body,
        });
        const { data } = axiosData;

        return data as Promise<TRes | undefined>;
    }
}
