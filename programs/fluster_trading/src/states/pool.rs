use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
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
    /// Which config the pool belongs
    pub app_config: Pubkey,
    /// Which config the vault belongs
    pub vault_bump: u8,
    /// Token oracle account
    pub token_oracle: Pubkey,
    /// Token
    pub token_vault: Pubkey,
    /// Mint information for token
    pub token_mint: Pubkey,
    /// mint decimals
    pub mint_decimals: u8,
    /// max leverage allowed
    pub max_leverage: u8,
    /// token program to support both spl token & token 2022 extensions
    pub token_program: Pubkey,
    /// main authority bump
    pub auth_bump: u8,
    /// Bitwise representation of the state of the pool
    /// bit0, 1: disable deposit(value is 1), 0: normal
    /// bit1, 1: disable withdraw(value is 2), 0: normal
    /// bit2, 1: disable swap(value is 4), 0: normal
    pub status: u8,
    /// padding for future updates
    pub padding: [u64; 32],
}

impl PoolState {
    pub fn initialize(
        &mut self,
        auth_bump: u8,
        vault_bump: u8,
        max_leverage: u8,
        app_config: Pubkey,
        token_vault: Pubkey,
        token_oracle: Pubkey,
        token_mint: &InterfaceAccount<Mint>,
    ) {
        self.app_config = app_config.key();
        self.token_vault = token_vault;
        self.token_mint = token_mint.key();
        self.token_program = *token_mint.to_account_info().owner;
        self.auth_bump = auth_bump;
        self.vault_bump = vault_bump;
        self.mint_decimals = token_mint.decimals;
        self.token_oracle = token_oracle;
        self.max_leverage = max_leverage;
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
