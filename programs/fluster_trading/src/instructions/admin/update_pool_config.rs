use std::cell::RefMut;

use crate::curve::fees::FEE_RATE_DENOMINATOR_VALUE;
use crate::error::ErrorCode;
use crate::states::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdatePoolState<'info> {
    /// The admin
    #[account(mut, constraint = payer.key() == crate::admin::id() @ ErrorCode::InvalidOwner)]
    pub payer: Signer<'info>,

    /// Pool state  account to be changed
    #[account(mut)]
    pub pool_state: AccountLoader<'info, PoolState>,
}

pub fn update_pool_state(ctx: Context<UpdatePoolState>, param: u8, value: u64) -> Result<()> {
    let pool_state = &mut ctx.accounts.pool_state.load_mut()?;
    let match_param = Some(param);
    match match_param {
        Some(0) => update_protocol_fee_rate(pool_state, value),
        Some(1) => update_trading_fee_rate(pool_state, value),
        // @dev: Further update
        //
        _ => return err!(ErrorCode::InvalidInput),
    }

    Ok(())
}

fn update_protocol_fee_rate(pool_state: &mut RefMut<PoolState>, protocol_fee_rate: u64) {
    assert!(protocol_fee_rate + (pool_state.trading_fee_rate as u64) <= FEE_RATE_DENOMINATOR_VALUE);
    pool_state.protocol_fee_rate = u16::try_from(protocol_fee_rate).unwrap();
}

fn update_trading_fee_rate(pool_state: &mut RefMut<PoolState>, trading_fee_rate: u64) {
    assert!(trading_fee_rate + (pool_state.protocol_fee_rate as u64) <= FEE_RATE_DENOMINATOR_VALUE);
    pool_state.trading_fee_rate = u16::try_from(trading_fee_rate).unwrap();
}
