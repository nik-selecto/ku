export const HOST = 'https://api.kucoin.com' as const;

type EndpointType = {
    endpoint: string,
    resolver?: (...params: string[]) => string;
}

export const GET: Record<string, EndpointType> = {
    accounts: { endpoint: '/api/v1/accounts' as const },
    order: { endpoint: '/api/v1/orders' as const },
};

export const POST: Record<string, EndpointType> = {
    orders: { endpoint: '/api/v1/orders' as const },
    bulletPrivate: { endpoint: '/api/v1/bullet-private' as const },
};
