export const tradingviewEmbedded = (symbol: string, exName: string) => {
  return `<!DOCTYPE html>
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
};
