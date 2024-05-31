use anchor_lang::prelude::*;

/// Emitted when initialize new pool
#[event]
pub struct PoolInitialized {
    #[index]
    pub pool_id: Pubkey,
    /// max leverage
    pub max_leverage: u8,
    /// token oracle
    pub token_oracle: Pubkey,
    /// token mint
    pub token_mint: Pubkey,
}

/// Emitted when place an betting order
#[event]
pub struct OrderPlaced {
    #[index]
    pub betting_id: Pubkey,
    #[index]
    pub pool_id: Pubkey,
    /// pool vault
    pub token_vault_before: u64,
    /// amount in
    pub amount_in: u64,
    /// trade direction
    pub trade_direction: u8,
    /// leverage
    pub leverage: u8,
    /// duration
    pub duration: u64,
}
