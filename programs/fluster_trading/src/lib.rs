pub mod curve;
pub mod error;
pub mod instructions;
pub mod states;
pub mod utils;

use anchor_lang::prelude::*;
use instructions::*;

use solana_security_txt::security_txt;
use spl_memo::solana_program::native_token::LAMPORTS_PER_SOL;

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "fluster_trading",
    project_url: "https://github.com/danielbui12/fluster_trading",
    contacts: "link:huytung139@gmail.com",
    policy: "https://github.com/danielbui12/fluster_trading",
    source_code: "https://github.com/danielbui12/fluster_trading",
    preferred_languages: "en",
    auditors: "#"
}

#[cfg(feature = "devnet")]
declare_id!("HdNeVJt9x8p5G5Q99A3PySR4bNnzaLzHdSAw5B5eWZzC");
#[cfg(not(feature = "devnet"))]
declare_id!("HdNeVJt9x8p5G5Q99A3PySR4bNnzaLzHdSAw5B5eWZzC");

pub mod admin {
    use anchor_lang::prelude::declare_id;
    #[cfg(feature = "devnet")]
    declare_id!("EgwWVewxT4qrvkSpfx3T6hMUztGZPR8XiAGRiYGKdUc7");
    #[cfg(not(feature = "devnet"))]
    declare_id!("EgwWVewxT4qrvkSpfx3T6hMUztGZPR8XiAGRiYGKdUc7");
}

pub mod pool_fee_receiver {
    use anchor_lang::prelude::declare_id;
    #[cfg(feature = "devnet")]
    declare_id!("Kd8e8t428wuB68bpksHTqu4VbM97cqYa3AKP3osYsKH");
    #[cfg(not(feature = "devnet"))]
    declare_id!("Kd8e8t428wuB68bpksHTqu4VbM97cqYa3AKP3osYsKH");
}

pub mod currency {
    use anchor_lang::prelude::declare_id;
    #[cfg(feature = "devnet")]
    declare_id!("animnB3RP6asQBWJhCCNGiLqM9wEZoFhAe3h7UmU2qM");
    #[cfg(not(feature = "devnet"))]
    declare_id!("animnB3RP6asQBWJhCCNGiLqM9wEZoFhAe3h7UmU2qM");
}

pub const AUTH_SEED: &str = "vault_auth_seed";
pub const USER_SEED: &str = "user_auth_seed";
pub const CLOCK_WORK_FEE: u64 = LAMPORTS_PER_SOL / 100;

#[program]
pub mod fluster_trading {
    use super::*;

    /// Initialize token pool
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    /// * `trading_fee_rate` - the trading fee rate
    /// * `protocol_fee_rate` - the protocol fee rate
    ///
    pub fn initialize(
        ctx: Context<Initialize>,
        trading_fee_rate: u16,
        protocol_fee_rate: u16,
    ) -> Result<()> {
        instructions::initialize(ctx, trading_fee_rate, protocol_fee_rate)
    }

    /// Update pool state
    /// Must be called by the current admin
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    /// * `param`- The value can be 0 | 1, otherwise will report a error
    /// * `value`- The value of the equivalent field
    ///
    pub fn update_pool_state(ctx: Context<UpdatePoolState>, param: u8, value: u64) -> Result<()> {
        instructions::update_pool_state(ctx, param, value)
    }

    /// Collect fees
    /// Must be called by the current admin
    ///
    /// # Arguments
    ///
    /// * `ctx` - The context of accounts
    /// * `amount_requested` - Amount to collect
    ///
    pub fn collect_fee(ctx: Context<CollectFee>, amount_requested: u64) -> Result<()> {
        instructions::collect_fee(ctx, amount_requested)
    }

    /// User deposits token to vault
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    /// * `amount` - Amount to deposit
    ///
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit(ctx, amount)
    }

    /// User withdraws token from vault
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    /// * `amount` - Amount to withdraw
    ///
    pub fn withdraw(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::withdraw(ctx, amount)
    }

    /// User close account
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    ///
    pub fn close_account(ctx: Context<CloseAccount>) -> Result<()> {
        instructions::close_account(ctx)
    }

    /// Place an betting order for the given token pool
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    /// * `amount` - the amount to bet
    /// * `trade_direction` - the price trading. 1 for up, 0 for down
    ///
    pub fn betting(
        ctx: Context<Betting>,
        thread_id: Vec<u8>,
        amount: u64,
        price_slippage: u64,
        destination_timestamp: i64,
        trade_direction: u8,
    ) -> Result<()> {
        instructions::betting(
            ctx,
            thread_id,
            amount,
            price_slippage,
            destination_timestamp,
            trade_direction,
        )
    }

    /// Reveal the order after the deadline
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    ///
    pub fn reveal(ctx: Context<Reveal>) -> Result<()> {
        instructions::reveal(ctx)
    }

    /// Cancel the betting order
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    ///
    pub fn cancel(ctx: Context<Reveal>) -> Result<()> {
        instructions::cancel(ctx)
    }

    /// Complete the order after revealed
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    ///
    pub fn complete(ctx: Context<Complete>) -> Result<()> {
        instructions::complete(ctx)
    }
}
