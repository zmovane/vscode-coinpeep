import { StatusBarAlignment, StatusBarItem, window } from "vscode";
import { Config } from "../utils/config";
import request from "../utils/http";
import { Quote } from "../entity/coingecko";
const DEFAULT_COIN_IDS = ["bitcoin", "ethereum"];
export class StatusBar {
  enable = true;
  coinIds = DEFAULT_COIN_IDS;
  statusBarItems = new Map<string, StatusBarItem>();
  constructor() {
    this.enable = Config.get("statusbar.enable");
    if (this.enable) {
      this.coinIds = Config.get("statusbar.coinIds", DEFAULT_COIN_IDS);
      this.refresh();
    }
  }

  refresh() {
    this.updateStatusBarItems();
  }

  toggle() {
    this.enable = Config.get("statusbar.enable");
    for (const item of this.statusBarItems.values()) {
      this.enable ? item.show() : item.hide();
    }
  }

  updateCoinIds() {
    const newCoinIds: string[] = Config.get(
      "statusbar.coinIds",
      DEFAULT_COIN_IDS
    );
    for (const coinId of this.coinIds) {
      if (!newCoinIds.includes(coinId)) {
        this.statusBarItems.get(coinId)?.hide();
      }
    }
    this.coinIds = newCoinIds;
    this.refresh();
  }

  updateStatusBarItems() {
    this._fetchCoinsMarkets(this.coinIds).then((quotes) => {
      for (const quote of quotes) {
        const item =
          this.statusBarItems.get(quote.id) ??
          window.createStatusBarItem(StatusBarAlignment.Left);
        const currency = quote.symbol.toUpperCase();
        const icon = quote.price_change_percentage_24h < 0 ? "📉" : "📈";
        const price = `$${quote.current_price.toPrecision(6)}`;
        const percent = `${quote.price_change_percentage_24h.toFixed(3)}%`;
        item.text = `${currency} ${icon} ${price} ${percent}`;
        this.enable ? item.show() : item.hide();
        this.statusBarItems.set(quote.id, item);
      }
    });
  }

  private async _fetchCoinsMarkets(ids: string[]) {
    const data = {
      ids: ids.join(","),
      vs_currency: "USD",
    };
    const response = await request(
      "GET",
      "https://api.coingecko.com/api/v3/coins/markets",
      data,
      {}
    );
    if (this._isOk(response.status)) {
      const quotes: Quote[] = JSON.parse(response.data);
      return quotes;
    }
    return [];
  }

  private _isOk(status: number) {
    return status >= 200 && status < 300;
  }
}
