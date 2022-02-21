import { Ticker } from "../entity/ticker";
import { request, isOK } from "../utils/http";
import { Exchange } from "./exchange";

export class Huobi extends Exchange {
  httpUrl = "https://api.huobi.pro/";

  pairOf(baseCurr: string, quoteCurr: string = "USDT"): string {
    return `${baseCurr}${quoteCurr}`.toLowerCase();
  }
  async getTicker(symbol: string): Promise<Ticker | undefined> {
    const response = await request(
      "GET",
      `${this.httpUrl}/market/detail/merged`,
      { symbol: symbol },
      {}
    );

    if (isOK(response)) {
      const exResponse: ExResponse = JSON.parse(response.data);
      return {
        exName: this.name,
        symbol: symbol,
        price: exResponse.tick.close,
      };
    }
  }
}

interface ExResponse {
  ch: string;
  status: string;
  ts: number;
  tick: ExTicker;
}

interface ExTicker {
  id: string;
  bid: number[];
  ask: number[];
  open: number;
  close: number;
  low: number;
  hight: number;
}
