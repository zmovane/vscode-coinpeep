export interface Quote {
  symbol: string;
  name: string;
  image: string;
  current_price: string;
  price_change_percentage_24h: string;
  market_cap_change_percentage_24h: string;
  total_volume: string;
  market_cap: string;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
}
