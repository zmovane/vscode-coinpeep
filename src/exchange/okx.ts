import { Ticker } from "../entity/ticker";
import { request, isOK } from "../utils/http";
import { Exchange } from "./exchange";

export class OKX extends Exchange {
  httpUrl = "https://www.okx.com/api/v5/";

  pairOf(baseCurr: string, quoteCurr: string = "USDT"): string {
    return `${baseCurr}-${quoteCurr}`.toUpperCase();
  }
  async getTicker(symbol: string): Promise<Ticker | undefined> {
    const response = await request(
      "GET",
      `${this.httpUrl}/market/ticker`,
      { instId: symbol },
      {}
    );

    if (isOK(response)) {
      const exResponse: ExResponse<ExTicker> = JSON.parse(response.data);
      const exTicker = exResponse.data[0];
      return {
        exName: this.name,
        symbol: exTicker.instId,
        price: exTicker.last,
      };
    }
  }
}
interface ExResponse<T> {
  code: string;
  data: T[];
}
interface ExTicker {
  instType: string;
  instId: string;
  last: number;
}
