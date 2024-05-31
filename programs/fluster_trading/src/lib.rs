pub mod curve;
pub mod error;
pub mod instructions;
pub mod states;
pub mod utils;

use anchor_lang::prelude::*;
use instructions::*;

use solana_security_txt::security_txt;

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

pub const AUTH_SEED: &str = "vault_auth_seed";
pub const USER_SEED: &str = "user_auth_seed";

#[program]
pub mod fluster_trading {
    use super::*;

    // The configuration of AMM protocol, include trade fee and protocol fee
    /// # Arguments
    ///
    /// * `ctx`- The accounts needed by instruction.
    /// * `index` - The index of amm config, there may be multiple config.
    /// * `fund_fee_rate` - Fund fee rate, can be changed.
    /// * `protocol_fee_rate` - Protocol fee rate, can be changed.
    ///
    pub fn create_app_config(
        ctx: Context<CreateAppConfig>,
        index: u16,
        protocol_fee_rate: u64,
        fund_fee_rate: u64,
    ) -> Result<()> {
        instructions::create_app_config(ctx, index, protocol_fee_rate, fund_fee_rate)
    }

    /// Updates the owner of the amm config
    /// Must be called by the current owner or admin
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    /// * `trade_fee_rate`- The new trade fee rate of amm config, be set when `param` is 0
    /// * `protocol_fee_rate`- The new protocol fee rate of amm config, be set when `param` is 1
    /// * `fund_fee_rate`- The new fund fee rate of amm config, be set when `param` is 2
    /// * `new_owner`- The config's new owner, be set when `param` is 3
    /// * `new_fund_owner`- The config's new fund owner, be set when `param` is 4
    /// * `param`- The value can be 0 | 1, otherwise will report a error
    ///
    pub fn update_app_config(ctx: Context<UpdateAppConfig>, param: u8, value: u64) -> Result<()> {
        instructions::update_app_config(ctx, param, value)
    }

    /// Initialize token pool
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    /// * `max_leverage` - the maximum leverage allowed
    ///
    pub fn initialize(ctx: Context<Initialize>, max_leverage: u8) -> Result<()> {
        instructions::initialize(ctx, max_leverage)
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
        trade_direction: u8,
        leverage: u8,
        amount: u64,
        duration: u64,
    ) -> Result<()> {
        instructions::betting(ctx, trade_direction, leverage, amount, duration)
    }

    /// Cancel the betting order
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    ///
    pub fn cancel(ctx: Context<Betting>) -> Result<()> {
        // instructions::cancel(ctx)
        Ok(())
    }

    /// Reveal the order after the deadline
    ///
    /// # Arguments
    ///
    /// * `ctx`- The context of accounts
    ///
    pub fn reveal(ctx: Context<Betting>) -> Result<()> {
        // instructions::reveal(ctx)
        Ok(())
    }
}
