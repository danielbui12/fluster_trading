use anchor_lang::prelude::*;
use std::ops::{BitAnd, BitOr, BitXor};
/// Seed to derive account address and signature
pub const POOL_SEED: &str = "pool";
pub const POOL_VAULT_SEED: &str = "pool_vault";

pub enum PoolStatusBitIndex {
    Bet,
    Withdraw,
}

#[derive(PartialEq, Eq)]
pub enum PoolStatusBitFlag {
    Enable,
    Disable,
}

#[account(zero_copy(unsafe))]
#[repr(packed)]
#[derive(Default, Debug, InitSpace)]
pub struct PoolState {
    /// Token oracle account
    pub token_oracle: Pubkey,
    /// Token
    pub token_vault: Pubkey,
    /// main authority bump
    pub auth_bump: u8,
    /// Bitwise representation of the state of the pool
    /// bit0, 1: disable deposit(value is 1), 0: normal
    /// bit1, 1: disable withdraw(value is 2), 0: normal
    /// bit2, 1: disable swap(value is 4), 0: normal
    pub status: u8,
    /// The protocol fee. DENOMINATOR: 10_000 aka 100%
    pub protocol_fee_rate: u16,
    /// The trading fee. DENOMINATOR: 10_000 aka 100%
    pub trading_fee_rate: u16,
    /// padding for future updates
    pub padding: [u64; 32],
}

impl PoolState {
    pub fn initialize(
        &mut self,
        auth_bump: u8,
        trading_fee_rate: u16,
        protocol_fee_rate: u16,
        token_vault: Pubkey,
        token_oracle: Pubkey,
    ) {
        self.token_vault = token_vault;
        self.auth_bump = auth_bump;
        self.token_oracle = token_oracle;
        self.trading_fee_rate = trading_fee_rate;
        self.protocol_fee_rate = protocol_fee_rate;
    }

    pub fn set_status(&mut self, status: u8) {
        self.status = status
    }

    pub fn set_status_by_bit(&mut self, bit: PoolStatusBitIndex, flag: PoolStatusBitFlag) {
        let s = u8::from(1) << (bit as u8);
        if flag == PoolStatusBitFlag::Disable {
            self.status = self.status.bitor(s);
        } else {
            let m = u8::from(255).bitxor(s);
            self.status = self.status.bitand(m);
        }
    }

    /// Get status by bit, if it is `noraml` status, return true
    pub fn get_status_by_bit(&self, bit: PoolStatusBitIndex) -> bool {
        let status = u8::from(1) << (bit as u8);
        self.status.bitand(status) == 0
    }
}
