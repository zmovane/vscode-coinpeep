import * as vscode from "vscode";
import { CoingeckoProvider } from "./provider/coingecko";
import { CoinmarketcapProvider } from "./provider/coinmarketcap";
import { tradingviewEmbedded } from "./template/tradingview";
import ReusedWebviewPanel from "./webview/ReusedWebviewPanel";

const MIN_INTERVAL: number = 3000;
const MAX_INTERVAL: number = 20_000;
const DEFAULT_INTERVAL: number = 10_000;
const extensionID: string = "coinpeep";

let looper: NodeJS.Timer | null = null;

export function activate(context: vscode.ExtensionContext) {
  const confInterval: number =
    vscode.workspace.getConfiguration(extensionID).get("refreshInterval") ?? 10;

  const apiKey: string | undefined = vscode.workspace
    .getConfiguration(extensionID)
    .get("coinmarketcap.apiKey");

  vscode.window.showErrorMessage(confInterval.toString());

  const coingeckoProvider = new CoingeckoProvider(extensionID);
  const coinmarketcapProvider = new CoinmarketcapProvider(extensionID, apiKey);

  registerCoingeckoComponents(coingeckoProvider);
  registerCoinmarketcapComponents(coinmarketcapProvider);

  const cronTask = () => {
    coingeckoProvider.refresh();
    coinmarketcapProvider.refresh();
  };

  const intervalInMills = Math.max(
    MIN_INTERVAL,
    Math.min(confInterval === 0 ? DEFAULT_INTERVAL : confInterval, MAX_INTERVAL)
  );
  looper = setInterval(cronTask, intervalInMills);
  // call the constructor again if the configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      registerCoingeckoComponents(coingeckoProvider);
      registerCoinmarketcapComponents(coinmarketcapProvider);
    })
  );
}

function registerCoinmarketcapComponents(provider: CoinmarketcapProvider) {
  vscode.window.registerTreeDataProvider("coinmarketcapTreeView", provider);
  vscode.commands.registerCommand("coinmarketcapTreeView.refreshEntry", () =>
    provider.refresh()
  );
  vscode.commands.registerCommand(
    "coinmarketcapTreeView.clickItem",
    (symbol) => {
      createWebviewPannel([symbol, "BINANCE"]);
    }
  );
}

function registerCoingeckoComponents(provider: CoingeckoProvider) {
  vscode.window.registerTreeDataProvider("coingeckoTreeView", provider);
  vscode.commands.registerCommand("coingeckoTreeView.refreshEntry", () =>
    provider.refresh()
  );
  vscode.commands.registerCommand("coingeckoTreeView.clickItem", (symbol) => {
    createWebviewPannel([symbol, "BINANCE"]);
  });
}

function createWebviewPannel(args: string[]) {
  const panel = ReusedWebviewPanel.create(
    "TradingView",
    "TradingView",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );
  const [symbol, exName] = args;
  panel.webview.html = tradingviewEmbedded(symbol, exName);
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (looper) {
    clearInterval(looper);
    looper = null;
  }
}
