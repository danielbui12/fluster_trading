use anchor_lang::prelude::*;

pub const BETTING_STATE_SEED: &str = "betting_state";

#[account(zero_copy(unsafe))]
#[repr(packed)]
#[derive(Default, Debug, InitSpace)]
pub struct BettingState {
    /// Which betting belongs
    pub pool_state: Pubkey,
    /// amount of bet
    pub bet_amount: u64,
    /// trade_direction
    pub trade_direction: u8,
    /// leverage
    pub leverage: u8,
    /// current price
    pub current_price: u64,
    /// destination timestamp
    pub destination_timestamp: u64,
}

impl BettingState {
    pub fn initialize(
        &mut self,
        trade_direction: u8,
        bet_amount: u64,
        pool_state: Pubkey,
        leverage: u8,
        current_price: u64,
        destination_timestamp: u64,
    ) {
        self.trade_direction = trade_direction;
        self.bet_amount = bet_amount;
        self.pool_state = pool_state;
        self.leverage = leverage;
        self.current_price = current_price;
        self.destination_timestamp = destination_timestamp;
    }
}
