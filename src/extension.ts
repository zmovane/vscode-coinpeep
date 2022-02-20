// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CoingeckoProvider } from "./provider/coingecko";
import { CoinmarketcapProvider } from "./provider/coinmarketcap";
import { tradingviewEmbedded } from "./template/tradingview";
import ReusedWebviewPanel from "./webview/ReusedWebviewPanel";

const extensionID: string = "coinpeep";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  setupCoingeckoComponents();
  setupCoinmarketcapComponents();
  // call the constructor again if the configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(setupCoinmarketcapComponents)
  );
}

function setupCoinmarketcapComponents() {
  const apiKey: string | undefined = vscode.workspace
    .getConfiguration("extensionName")
    .get("coinmarketcap.apiKey");

  const coinmarketcapProvider = new CoinmarketcapProvider(
    extensionID,
    apiKey
  );

  vscode.window.registerTreeDataProvider(
    "coinmarketcapTreeView",
    coinmarketcapProvider
  );

  vscode.commands.registerCommand("coinmarketcapTreeView.refreshEntry", () =>
    coinmarketcapProvider.refresh()
  );

  vscode.commands.registerCommand(
    "coinmarketcapTreeView.clickItem",
    (symbol) => {
      createWebviewPannel([symbol, "BINANCE"]);
    }
  );
}

function setupCoingeckoComponents() {
  const coingeckoProvider = new CoingeckoProvider(extensionID);
  vscode.window.registerTreeDataProvider(
    "coingeckoTreeView",
    coingeckoProvider
  );
  vscode.commands.registerCommand("coingeckoTreeView.refreshEntry", () =>
    coingeckoProvider.refresh()
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
export function deactivate() {}
