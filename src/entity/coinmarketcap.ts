export interface Response<T> {
  data: T[];
  status: Status;
}
export interface Status {
  error_code: number;
  error_message: string;
}
export interface Coin {
  name: string;
  symbol: string;
  quote: Quote;
}
export interface Quote {
  USDT: USDT;
}
export interface USDT {
  price: string;
  volume_24h: string;
  percent_change_24h: string;
  percent_change_7d: string;
  market_cap: string;
}
