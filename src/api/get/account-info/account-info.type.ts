export type AccountInfoResDto = [{
  id: string,
  currency: string,
  type: 'main' | 'trade' | 'margin' | 'pool',
  balance: string,
  available: string,
  holds: string,
}];

export class AccountInfoParamsDto {
    type?: 'main' | 'trade' | 'margin';

    currency?: string;
}
