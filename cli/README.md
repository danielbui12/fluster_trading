Fluster CLI

```sh
fluster -h
fluster config get
fluster config set --wallet /Users/tung/.config/solana/id.json --rpc https://api.devnet.solana.com --commitment finalized --slippage 100
fluster deposit 1 # 1 SOL
fluster balance
fluster view -t pool
fluster bet -p 2SujAUBgY2BZzKSmChVd9EWysiSE8ZuLnycETEYo8zmp -a 1 --du 60 --di Up
fluster view -t position
fluster await HLc42J3gCfCpsu66wFwoSZLdwCfq1ZHxGPy2JahXXECv
fluster complete HLc42J3gCfCpsu66wFwoSZLdwCfq1ZHxGPy2JahXXECv
```

- add this `alias` to profile
```sh
...
alias fluster="node /Users/tung/Documents/fluster_trading/cli/dist/src/index.js
...

source ~/.bash_profile or your profile to save script
```