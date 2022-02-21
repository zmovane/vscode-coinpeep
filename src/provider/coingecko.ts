import * as vscode from "vscode";
import * as path from "path";
import {request, isOK} from "../utils/http";
import { ZERO, Decimal } from "../utils/bignumber";
import { Quote } from "../entity/coingecko";
export class CoingeckoProvider implements vscode.TreeDataProvider<Item> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Item | undefined | null | void
  > = new vscode.EventEmitter<Item | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Item | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private extensionID: string;
  private stableCoin = "USD";
  private httpUrl = "https://api.coingecko.com/api/v3";

  constructor(extensionID: string) {
    this.extensionID = extensionID;
  }

  getTreeItem(item: Item): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return item;
  }
  getChildren(): vscode.ProviderResult<Item[]> {
    return Promise.resolve(this._getItems());
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private async _getItems(): Promise<Item[]> {
    const data = {
      vs_currency: this.stableCoin,
      order: "market_cap_desc",
      per_page: 100,
      page: 1,
      sparkline: false,
    };
    const response = await request(
      "GET",
      `${this.httpUrl}/coins/markets`,
      data,
      {}
    );
    const result: Quote[] = JSON.parse(response.data);
    if (isOK(response)) {
      return result.map((quote: Quote) => this._fillItem(quote));
    } else {
      vscode.window.showErrorMessage(
        `${this.extensionID}: Failed to request coingecko API`
      );
    }
    return [];
  }

  private _fillItem(quote: Quote): Item {
    const price = new Decimal(quote.current_price).precision(6);
    const percent = new Decimal(quote.price_change_percentage_24h);
    const percentPrefix = percent.gte(ZERO) ? "+" : "";
    const percentDisplay = `${percentPrefix}${percent.toFixed(2)}%`.padEnd(15);
    const symbolDisplay = quote.symbol.toUpperCase().padEnd(11);
    const priceDisplay = `$${price}`;
    const label =
      symbolDisplay.padStart(symbolDisplay.length + 4) + percentDisplay;
    const iconPath = percent.gt(ZERO)
      ? this._iconPath("up.png")
      : this._iconPath("down.png");
    return new Item(quote.symbol, label, iconPath, priceDisplay);
  }

  private _iconPath(iconName: string): string {
    return path.join(__filename, "..", "..", "..", "resources", iconName);
  }
}
class Item extends vscode.TreeItem {
  constructor(
    currency: string,
    label: string,
    iconPath: vscode.Uri | string,
    price: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = iconPath;
    this.description = price;
    this.command = {
      title: "Coingecko",
      command: "coingeckoTreeView.clickItem",
      arguments: [currency],
    };
  }
}
