# FLUSTER TRADING.

## Environment Setup

1. Install Rust v1.78.0
2. Install Solana v1.17.0 and then run solana-keygen new to create a keypair at the default location.
3. Install Anchor v0.29.0

## Quickstart

Clone the repository and test the program.

```shell
git clone https://github.com/danielbui12/fluster_trading
cd fluster_trading
yarn install
# cargo install -f --locked --git https://github.com/danielbui12/clockwork clockwork-cli
yarn setup:env
yarn setup:node
yarn test
```

## Fork program on mainnet

```sh
solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s forked-programs/metadata.so
solana program dump -u m F8dKseqmBoAkHx3c58Lmb9TgJv5qeTf3BbtZZSEzYvUa forked-programs/clockwork_network.so
solana program dump -u m CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh forked-programs/clockwork_thread_v2.so
```

## How it works

### Context

#### Spot/Swap Trading vs. Fluster Trading

In spot/swap trading, traders buy and sell assets at the current market price, aiming to profit from price movements over varying durations. This method often requires significant capital to maximize profits, as larger positions typically yield greater returns. While it offers flexibility, the complexity and time involved in holding and managing positions can be challenging.

#### Futures Trading vs. Fluster Trading
Futures trading, on the other hand, involves committing to buy or sell an asset at a predetermined price on a future date. This high-risk approach leverages potential gains but also amplifies potential losses. Successful futures trading demands a deep understanding of technical indicators, market trends, and risk management strategies. Traders must be adept at analyzing charts, monitoring market news, and using advanced technical analysis tools to make informed decisions.

#### Why Choose Fluster Trading?
Fluster Trading simplifies the trading process by focusing on binary-options trading. This method allows users to predict whether an asset's price will rise or fall within a specific time frame. It's designed to be user-friendly, with a lower barrier to entry and quicker profit potential compared to traditional trading methods.


Key features of Fluster Trading include:
- Ease of Use: Our platform is intuitive, making it accessible even to beginners.
- Quick Profits: Binary-options trading offers the potential for rapid returns.
- Set Slippage: Fluster allows users to set the slippage, giving them more control over their trades.



### Asset

- Fluster USD (ftUSD): stable coin, token to enter the trading

### Techstack

- Solana
- Anchor
- Clockwork
- Pyth

### WorkFlow

1. Deposit
    
    Users transfer SOL then receive amount of ftUSD based on Pyth price feed
    
2. Trading
    - Place an taker order: i.e. you indicate that the token price is going Up in next 5 min, then you place an taker order with:
        - Token price: current market price (based on Pyth price feed).
        - Duration: the “5 min”
        - Trading direction: Up
        
        ```
        💡 **Fluster allows users to set the slippage.**
        When execute the instruction, the price of token may change caused by the Pyth price feed. If the market price is **less** than the slippage price and trading direction is **Down**, or, the market price is **greater** than the slippage price and the trading direction is **Up**, subsequently the order is automatically **cancelled**.
        ```
        
        - The **“bet”** instruction will create a new Thread by making a CPI to Clockwork network for order fulfillment.
    - Await orders
        - After users placed orders successfully, everything next is just waiting for order fulfillment by Clockwork.
    - Cancel order
        
        Users have the option to cancel their orders if they have not yet been fulfilled by Clockwork. This will close Thread and cancel the betting.
        
    - Reveal oder
        
        After the duration of the order has passed, users can reveal their order. If the final price matches the user's prediction, they win and receive a payout. If not, the order is marked as lost. The reveal order operation will close the Thread and finalize the bet. The result price is also got from Pyth price feed
        
    - Complete order
        
        Anyone can invoke this instruction. The instruction is programmed to send the earning or remaining ftUSD after the orders are completed to the wallet who creates the betting. This avoids users leave the lost betting 😂. 
        
3. Withdraw
    
    Users can withdraw their earnings or remaining ftUSD after all of their orders are completed. The withdrawal will convert ftUSD back to SOL based on the current market price before transferring it back to the user's account.
    

### Fee

1. Protocol fee
    - 0.01%
    - Occurring when users place an order
    - i.e. I bet 10 ftUSD → I have to pay 10.1 ftUSD
2. Trading fee (aka. Taker fee)
    - 20% ⇒ rest 80%
    - Occurring if orders won
    - i.e. User bet 10 ftUSD → the order won → profit: 10 (amount in) + 10 * 0.8 = 18 ftUSDT →  total profit: 18 - 0.1 = 17.9 ftUSD