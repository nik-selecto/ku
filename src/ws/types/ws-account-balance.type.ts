import { WsSubjectEnum } from './enums/ws-subject.enum';
import { WsSubscriptionType } from './enums/ws-subscription.type';
import { WsPub } from './general/ws-pub';
import { WsSubChannelTypeType } from './general/ws-sub-channel-type.type';

type AccountBalanceTopicType = '/account/balance';

type RelationEventType =
    'main.deposit' // Deposit
    | 'main.withdraw_hold' // Hold withdrawal amount
    | 'main.withdraw_done' // Withdrawal done
    | 'main.transfer' // Transfer(Main account)
    | 'main.other' // Other operations(Main account)
    | 'trade.hold' // Hold(Trade account)
    | 'trade.setted' // Settlement(Trade account)
    | 'trade.transfer' // Transfer(Trade account)
    | 'trade.other' // Other operations(Trade account)
    | 'margin.hold' // Hold(Margin account)
    | 'margin.setted' // Settlement(Margin account)
    | 'margin.transfer' // Transfer(Margin account)
    | 'margin.other' // Other operations(Margin account)
    | 'other' // Others

export type SubAccountBalance = WsPub<{
    topic: AccountBalanceTopicType,
    subject: WsSubjectEnum.ACCOUNT_BALANCE,
    channelType: WsSubChannelTypeType,
    data: {

        total: string, // total balance
        available: string, // available balance
        availableChange: string, // the change of available balance
        currency: string, // currency
        hold: string, // hold amount
        holdChange: string, // the change of hold balance
        relationEvent: RelationEventType, // relation event
        relationEventId: string, // relation event id
        relationContext: {
            symbol: string,
            tradeId: string, // the trade Id when order is executed
            orderId: string,
        }, // the context of trade event
        time: string, // timestamp
    }
}>;

export type PubAccountBalance = {
    subject: WsSubjectEnum.ACCOUNT_BALANCE,
    type: WsSubscriptionType,
    topic: AccountBalanceTopicType,
    privateChannel: true,
};

export function publishAccountBalance(subscriptionType: WsSubscriptionType = 'subscribe'): PubAccountBalance {
    return {
        subject: WsSubjectEnum.ACCOUNT_BALANCE,
        type: subscriptionType,
        topic: '/account/balance',
        privateChannel: true,
    };
}

export type AccountBalanceCPS = [WsSubjectEnum.ACCOUNT_BALANCE, WsPub<PubAccountBalance>, SubAccountBalance];
