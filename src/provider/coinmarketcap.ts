import * as vscode from "vscode";
import * as path from "path";
import request from "../utils/http";
import { ZERO, Decimal } from "../utils/bignumber";
import { Coin, Response } from "../entity/coinmarketcap";
export class CoinmarketcapProvider implements vscode.TreeDataProvider<Item> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Item | undefined | null | void
  > = new vscode.EventEmitter<Item | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Item | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private apiKey: string | undefined;
  private extensionID: string;
  private stableCoin = "USDT";
  private httpUrl = "https://pro-api.coinmarketcap.com/v1";

  constructor(extensionID: string, apiKey: string | undefined) {
    this.apiKey = apiKey;
    this.extensionID = extensionID;

    if (!this.apiKey) {
      vscode.window
        .showInformationMessage(
          `${extensionID}: Please enter your CoinMarketCap API Key `,
          "Add API Key"
        )
        .then((selection) => {
          if (selection) {
            vscode.commands.executeCommand(
              "workbench.action.openSettings",
              `@ext:${extensionID}`
            );
          }
        });
    }
  }

  getTreeItem(item: Item): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return item;
  }
  getChildren(): vscode.ProviderResult<Item[]> {
    if (this.apiKey) {
      return Promise.resolve(this._getItems());
    } else {
      return Promise.resolve([]);
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private async _getItems(): Promise<Item[]> {
    const data = { start: 1, limit: 100, convert: this.stableCoin };
    const header = {
      "X-CMC_PRO_API_KEY": this.apiKey!,
    };
    const response = await request(
      "GET",
      `${this.httpUrl}/cryptocurrency/listings/latest`,
      data,
      header
    );
    const result: Response<Coin> = JSON.parse(response.data);
    if (this._isOk(response.status, () => result.status.error_code === 0)) {
      return result.data.map((coin: Coin) => this._fillItem(coin));
    } else {
      vscode.window.showErrorMessage(
        `${this.extensionID}: Failed to request CoinMarketCap API`
      );
    }
    return [];
  }

  private _fillItem(coin: Coin): Item {
    const price = new Decimal(coin.quote.USDT.price).precision(6);
    const percent = new Decimal(coin.quote.USDT.percent_change_24h);
    const percentPrefix = percent.gte(ZERO) ? "+" : "";
    const percentDisplay = `${percentPrefix}${percent.toFixed(2)}%`.padEnd(15);
    const symbolDisplay = coin.symbol.padEnd(11);
    const priceDisplay = `$${price}`;
    const label =
      symbolDisplay.padStart(symbolDisplay.length + 4) + percentDisplay;
    const iconPath = percent.gt(ZERO)
      ? this._iconPath("up.png")
      : this._iconPath("down.png");
    const pair = `${coin.symbol.toUpperCase()}${this.stableCoin}`;
    return new Item(pair, label, iconPath, priceDisplay);
  }

  private _iconPath(iconName: string): string {
    return path.join(__filename, "..", "..", "..", "resources", iconName);
  }

  private _isOk(status: number, otherCond: Function) {
    return status >= 200 && status < 300 && otherCond();
  }
}

class Item extends vscode.TreeItem {
  constructor(
    pair: string,
    label: string,
    iconPath: vscode.Uri | string,
    price: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = iconPath;
    this.description = price;
    this.command = {
      title: "CoinMarketCap",
      command: "coinmarketcapTreeView.clickItem",
      arguments: [pair],
    };
  }
}
