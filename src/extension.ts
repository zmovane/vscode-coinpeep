// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CoinmarketcapProvider } from "./provider/coinmarketcap";
import ReusedWebviewPanel from "./webview/ReusedWebviewPanel";

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

  vscode.commands.registerCommand(
    "coinmarketcapTreeView.clickItem",
    (symbol) => {
      const panel = ReusedWebviewPanel.create(
        "TradingView",
        "TradingView",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      const exName = "BINANCE";

      panel.webview.html = `<!DOCTYPE html>
	  <html>
		<head>
		  <meta charset="UTF-8" />
		  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		  <title>TradingView</title>
		</head>
		<body>
			<div class="tradingview-widget-container">
			<div id="tradingview_3d0b8"></div>
			<div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/${symbol}/?exchange=${exName}" rel="noopener" target="_blank"><span class="blue-text">${symbol} Chart</span></a> by TradingView</div>
			<script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
			<script type="text/javascript">
			new TradingView.widget(
			{
			"width": 980,
			"height": 610,
			"symbol": "${exName}:${symbol}",
			"interval": "D",
			"timezone": "Etc/UTC",
			"theme": "light",
			"style": "1",
			"locale": "en",
			"toolbar_bg": "#f1f3f6",
			"enable_publishing": false,
			"allow_symbol_change": true,
			"container_id": "tradingview_3d0b8"
			}
			);
			</script>
			</div>
		</body>
	  </html>`;
    }
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
