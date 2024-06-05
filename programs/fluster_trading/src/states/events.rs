use anchor_lang::prelude::*;

/// Emitted when initialize new pool
#[event]
pub struct PoolInitialized {
    #[index]
    pub pool_id: Pubkey,
    /// token oracle
    pub token_oracle: Pubkey,
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
    /// destination timestamp
    pub destination_timestamp: u64,
    /// thread id
    pub thread_id: Vec<u8>,
}

/// Emitted when place an betting order
#[event]
pub struct OrderFulfilled {
    #[index]
    pub betting_id: Pubkey,
    #[index]
    pub pool_id: Pubkey,
    /// result
    pub result: u64,
}

/// Emitted when cancel an betting order
#[event]
pub struct OrderCancelled {
    #[index]
    pub betting_id: Pubkey,
    #[index]
    pub pool_id: Pubkey,
}

/// Emitted when cancel an betting order
#[event]
pub struct OrderCompleted {
    #[index]
    pub betting_id: Pubkey,
    #[index]
    pub pool_id: Pubkey,
}
