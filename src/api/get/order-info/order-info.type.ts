export type OrderInfoParamsDto = {
  orderId: string
}

export class OrderInfoResDto {
    orderId!: string;

    symbol!: string;

    opType!: 'DEAL' | 'CANCEL';

    type!: 'limit' | 'market' | 'stop_limit' | 'stop_market';

    side!: 'buy' | 'sell';

    price!: string;

    size!: string;

    funds!: string;

    dealFunds!: string;

    dealSize!: string;

    fee!: string;

    feeCurrency!: string;

    stp!: 'CN' | 'CO' | 'DC' | 'CB' | '';

    stop!: 'entry' | 'loss' | '';

    stopTriggered!: boolean;

    stopPrice!: string;

    timeInForce!: 'GTC' | 'GTT' | 'IOC' | 'FOK';

    postOnly!: boolean;

    hidden!: boolean;

    iceberg!: boolean;

    visibleSize!: string;

    cancelAfter!: number;

    channel!: string;

    clientOid!: string;

    remark?: string;

    tags!: string;

    isActive!: boolean;

    cancelExist!: boolean;

    createdAt!: Date;

    tradeType!: 'TRADE' | 'MARGIN_TRADE';
}
