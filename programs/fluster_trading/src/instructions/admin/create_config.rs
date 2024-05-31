use crate::error::ErrorCode;
use crate::states::*;
use anchor_lang::prelude::*;
use std::ops::DerefMut;

#[derive(Accounts)]
#[instruction(index: u16)]
pub struct CreateAppConfig<'info> {
    /// Address to be set as protocol owner.
    #[account(
        mut,
        address = crate::admin::id() @ ErrorCode::InvalidOwner
    )]
    pub owner: Signer<'info>,

    /// Initialize config state account to store protocol owner address and fee rates.
    #[account(
        init,
        seeds = [
            APP_CONFIG_SEED.as_bytes(),
            &index.to_be_bytes()
        ],
        bump,
        payer = owner,
        space = 8 + AppConfig::INIT_SPACE
    )]
    pub app_config: Account<'info, AppConfig>,

    pub system_program: Program<'info, System>,
}

pub fn create_app_config(
    ctx: Context<CreateAppConfig>,
    index: u16,
    protocol_fee_rate: u64,
    fund_fee_rate: u64,
) -> Result<()> {
    let app_config = ctx.accounts.app_config.deref_mut();
    app_config.bump = ctx.bumps.app_config;
    app_config.index = index;
    app_config.protocol_fee_rate = protocol_fee_rate;
    app_config.fund_fee_rate = fund_fee_rate;
    Ok(())
}
