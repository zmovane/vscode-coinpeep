import * as vscode from "vscode";
import { CoingeckoProvider } from "./provider/coingecko";
import { CoinmarketcapProvider } from "./provider/coinmarketcap";
import { tradingviewEmbedded } from "./template/tradingview";
import { Config } from "./utils/config";
import ReusedWebviewPanel from "./widget/webview/ReusedWebviewPanel";
import { StatusBar } from "./widget/statusbar";
import { Binance } from "./exchange/binance";
import { OKX } from "./exchange/okx";
import { Huobi } from "./exchange/huobi";

const MIN_INTERVAL: number = 3000;
const MAX_INTERVAL: number = 20_000;
const DEFAULT_INTERVAL: number = 10_000;

const extensionName: string = "coinpeep";
const extensionID: string = `amovane.${extensionName}`;

const commandRefreshInterval = `${extensionName}.refreshInterval`;
const commandToggleStatusbar = `${extensionName}.statusbar.enable`;
const commandUpdateCoinIds = `${extensionName}.statusbar.coinIds`;
const commandUpdateCoinmarketcapApiKey = `${extensionName}.coinmarketcap.apiKey`;

let looper: NodeJS.Timer | null = null;

export function activate(context: vscode.ExtensionContext) {
  const confInterval: number =
    Config.get("refreshInterval") ?? DEFAULT_INTERVAL;

  const statusbar = new StatusBar();
  const coingeckoProvider = new CoingeckoProvider(extensionID);
  const coinmarketcapProvider = new CoinmarketcapProvider(extensionID);

  registerCoingeckoComponents(coingeckoProvider);
  registerCoinmarketcapComponents(coinmarketcapProvider);

  const cronTask = () => {
    statusbar.refresh();
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
    vscode.workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration(commandRefreshInterval)) {
          clearLooper();
          looper = setInterval(cronTask, intervalInMills);
        }
        if (e.affectsConfiguration(commandToggleStatusbar)) {
          statusbar.toggle();
        }
        if (e.affectsConfiguration(commandUpdateCoinIds)) {
          statusbar.updateCoinIds();
        }
        if (e.affectsConfiguration(commandUpdateCoinmarketcapApiKey)) {
          coinmarketcapProvider.updateAPIKey();
        }
      }
    )
  );
}

function registerCoinmarketcapComponents(provider: CoinmarketcapProvider) {
  vscode.window.registerTreeDataProvider("coinmarketcapTreeView", provider);
  vscode.commands.registerCommand("coinmarketcapTreeView.refreshEntry", () =>
    provider.refresh()
  );
  vscode.commands.registerCommand(
    "coinmarketcapTreeView.clickItem",
    (currency) => {
      createWebviewPannel(currency);
    }
  );
}

function registerCoingeckoComponents(provider: CoingeckoProvider) {
  vscode.window.registerTreeDataProvider("coingeckoTreeView", provider);
  vscode.commands.registerCommand("coingeckoTreeView.refreshEntry", () =>
    provider.refresh()
  );
  vscode.commands.registerCommand("coingeckoTreeView.clickItem", (currency) => {
    createWebviewPannel(currency);
  });
}

const stableCoins = ["USDT", "USD", "USDC", "HUSD", "BUSD"];
const exs = [new Binance(), new OKX(), new Huobi()];
async function createWebviewPannel(currency: string) {
  if (stableCoins.includes(currency.toUpperCase())) {
    return;
  }
  Promise.any(exs.map((ex) => ex.getTicker(ex.pairOf(currency)))).then(
    (ticker) => {
      if (ticker) {
        const panel = ReusedWebviewPanel.create(
          "TradingView",
          "TradingView",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
          }
        );
        panel.webview.html = tradingviewEmbedded(
          `${currency.toUpperCase()}USDT`,
          ticker.exName.toUpperCase()
        );
      }
    }
  );
}

function clearLooper() {
  if (looper) {
    clearInterval(looper);
    looper = null;
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  clearLooper();
}
