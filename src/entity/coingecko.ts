export interface Quote {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
}
