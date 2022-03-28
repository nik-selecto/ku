import { CurrencyType } from '../../../general/currency.general-type';

export type AccountInfoResDto = [{
  id: string,
  currency: CurrencyType,
  type: 'main' | 'trade' | 'margin' | 'pool',
  balance: string,
  available: string,
  holds: string,
}];

export class AccountInfoParamsDto {
    type?: 'main' | 'trade' | 'margin';

    currency?: CurrencyType;
}
