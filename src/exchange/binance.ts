import { Ticker } from "../entity/ticker";
import { request, isOK } from "../utils/http";
import { Exchange } from "./exchange";

export class Binance extends Exchange {
  httpUrl = "https://api.binance.com/api/v3";
  pairOf(baseCurr: string, quoteCurr: string = "USDT"): string {
    return `${baseCurr}${quoteCurr}`.toUpperCase();
  }
  async getTicker(symbol: string): Promise<Ticker | undefined> {
    const response = await request(
      "GET",
      `${this.httpUrl}/ticker/price`,
      { symbol: symbol },
      {}
    );

    if (isOK(response)) {
      const ticker: ExTicker = JSON.parse(response.data);
      return { exName: this.name, symbol: ticker.symbol, price: ticker.price };
    }
  }
}

interface ExTicker {
  symbol: string;
  price: number;
}
