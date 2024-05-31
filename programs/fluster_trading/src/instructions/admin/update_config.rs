use crate::curve::fees::FEE_RATE_DENOMINATOR_VALUE;
use crate::error::ErrorCode;
use crate::states::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateAppConfig<'info> {
    /// The amm config owner or admin
    #[account(address = crate::admin::id() @ ErrorCode::InvalidOwner)]
    pub owner: Signer<'info>,

    /// Amm config account to be changed
    #[account(mut)]
    pub app_config: Account<'info, AppConfig>,
}

pub fn update_app_config(ctx: Context<UpdateAppConfig>, param: u8, value: u64) -> Result<()> {
    let app_config = &mut ctx.accounts.app_config;
    let match_param = Some(param);
    match match_param {
        Some(0) => update_protocol_fee_rate(app_config, value),
        Some(1) => update_fund_fee_rate(app_config, value),
        _ => return err!(ErrorCode::InvalidInput),
    }

    Ok(())
}

fn update_protocol_fee_rate(app_config: &mut Account<AppConfig>, protocol_fee_rate: u64) {
    assert!(protocol_fee_rate <= FEE_RATE_DENOMINATOR_VALUE);
    assert!(protocol_fee_rate + app_config.fund_fee_rate <= FEE_RATE_DENOMINATOR_VALUE);
    app_config.protocol_fee_rate = protocol_fee_rate;
}

fn update_fund_fee_rate(app_config: &mut Account<AppConfig>, fund_fee_rate: u64) {
    assert!(fund_fee_rate <= FEE_RATE_DENOMINATOR_VALUE);
    assert!(fund_fee_rate + app_config.protocol_fee_rate <= FEE_RATE_DENOMINATOR_VALUE);
    app_config.fund_fee_rate = fund_fee_rate;
}
