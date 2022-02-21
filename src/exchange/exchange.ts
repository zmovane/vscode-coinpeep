import { Ticker } from "../entity/ticker";

export abstract class Exchange {
  name = this.constructor.name;
  abstract getTicker(symbol: string): Promise<Ticker | undefined>;

  abstract pairOf(baseCurr: string, quoteCurr: string): string;
}
