use anchor_lang::prelude::*;

use crate::curve::TradeDirection;

pub const BETTING_STATE_SEED: &str = "betting_state";

#[account(zero_copy(unsafe))]
#[repr(packed)]
#[derive(Default, Debug, InitSpace)]
pub struct BettingState {
    /// Which betting belongs
    pub pool_state: Pubkey,
    /// owner of this account
    pub owner: Pubkey,
    /// amount of bet
    pub bet_amount: u64,
    /// trade_direction
    pub trade_direction: TradeDirection,
    /// current price
    pub current_price: u64,
    /// destination timestamp
    pub destination_timestamp: u64,
    /// current price
    pub result_price: u64,
}

impl BettingState {
    pub fn initialize(
        &mut self,
        pool_state: Pubkey,
        owner: Pubkey,
        trade_direction: u8,
        bet_amount: u64,
        current_price: u64,
        destination_timestamp: u64,
    ) {
        self.trade_direction = TradeDirection::from_u8(trade_direction);
        self.bet_amount = bet_amount;
        self.pool_state = pool_state;
        self.current_price = current_price;
        self.destination_timestamp = destination_timestamp;
        self.result_price = 0;
        self.owner = owner;
    }
}
