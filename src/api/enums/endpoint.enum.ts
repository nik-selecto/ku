import { config } from 'dotenv';

config();

/* eslint-disable no-shadow */
export enum PostEndpointEnum {
  ORDERS = '/api/v1/orders',
  BULLET_PRIVATE = '/api/v1/bullet-private'
}

export enum GetEndpointEnum {
  ACCOUNTS = '/api/v1/accounts',
  ORDER = '/api/v1/orders',
  ACCOUNT_LEDGERS = '/api/v1/accounts/ledgers',
  ORDER_BOOK_LEVEL_2_20 = '/api/v1/market/orderbook/level2_20',
  ORDER_BOOK_LEVEL_2_100 = '/api/v1/market/orderbook/level2_100',
  ORDER_BOOK_V3_LEVEL_2 = '/api/v3/market/orderbook/level2',
}

export enum DeleteEndpointEnum {
  CANCEL_ORDER = '/api/v1/orders',
  CANCEL_ALL_ORDERS = '/api/v1/orders',
}

export const HOST = process.env.MODE === 'prod'
    ? 'https://api.kucoin.com' as const
    : 'https://openapi-sandbox.kucoin.com' as const;

export type MethodType = 'GET' | 'POST' | 'DELETE';
