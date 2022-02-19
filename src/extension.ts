// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CoinmarketcapProvider } from "./provider/coinmarketcap";

const extensionName: string = "coinpeep";
const extensionID: string = "amovane.coinpeep";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const apiKey: string | undefined = vscode.workspace
    .getConfiguration("extensionName")
    .get("coinmarketcap.apiKey");

  const coinmarketcapProvider = new CoinmarketcapProvider(
    extensionID,
    extensionName,
    apiKey
  );

  vscode.window.registerTreeDataProvider(
    "coinmarketcapTreeView",
    coinmarketcapProvider
  );

  vscode.commands.registerCommand("coinmarketcapTreeView.refreshEntry", () =>
    coinmarketcapProvider.refresh()
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
