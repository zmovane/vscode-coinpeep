# README

### Coinpeep

A vscode extension for help to take a quick peep of cryptocurrency prices as you code.


![](art/demo.gif)

## Features ✨

- Using [CoinGecko](https://www.coingecko.com/) and [CoinMarketCap](https://coinmarketcap.com/) to fetch cryptocurrency prices.

- Display top 100 coins on sidebar.
- Display the most concerned coins on statusbar.

## Extension Settings ⚙️

- `coinpeep.coinmarketcap.apiKey` : your coinmarketcap api key, please apply on https://pro.coinmarketcap.com/
- `coinpeep.refreshInterval` : interval for refresh cryptocurrency prices
- `coinpeep.statusbar.enable"` : enable or disable to display on statusbar
- `coinpeep.statusbar.coinIds` : coin ids ars use for coingecko API, default is `["bitcoin", "ethereum"]`, just find what you need on https://api.coingecko.com/api/v3/coins/list

## Release Notes

### 0.0.1

Initial release

## Run locally

- Open VS Code
- npm install installation packages
- npm run watch interactive watch mode to automatically transpile source files
- F5 to start debugging
