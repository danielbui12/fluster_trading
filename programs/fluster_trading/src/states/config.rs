use anchor_lang::prelude::*;

pub const APP_CONFIG_SEED: &str = "app_config";

/// Holds the current owner of the factory
#[account]
#[derive(Default, Debug, InitSpace)]
pub struct AppConfig {
    /// Bump to identify authority PDA
    pub bump: u8,
    /// Config index
    pub index: u16,
    /// The protocol fee
    pub protocol_fee_rate: u64,
    /// The fund fee, denominated in hundredths of a bip (10^-6)
    pub fund_fee_rate: u64,
    /// padding
    pub padding: [u64; 16],
}
