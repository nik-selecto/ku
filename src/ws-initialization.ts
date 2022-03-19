import qs from 'qs';
import { v4 } from 'uuid';
import Ws from 'ws';
import { KuRequest } from './api/index.api';

export async function wsInitialization() {
    const { instanceServers, token } = (await KuRequest.POST['/api/v1/bullet-private'].exec())!;
    const [server] = instanceServers;
    const id = v4();
    const ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);

    return { ws, id };
}
