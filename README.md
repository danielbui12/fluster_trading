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
cargo install -f --locked --git https://github.com/danielbui12/clockwork clockwork-cli
yarn setup
yarn test test
```

## Fork program on mainnet

```sh
solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s forked-programs/metadata.so
solana program dump -u m F8dKseqmBoAkHx3c58Lmb9TgJv5qeTf3BbtZZSEzYvUa forked-programs/clockwork_network.so
solana program dump -u m CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh forked-programs/clockwork_thread_v2.so
```

