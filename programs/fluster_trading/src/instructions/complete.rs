use crate::curve::{Calculator, TradeDirection};
use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::close_account;
use crate::utils::transfer_token;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount},
};

#[derive(Accounts)]
pub struct Complete<'info> {
    /// The user performing the trading
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: authority
    #[account(
        seeds = [
            crate::AUTH_SEED.as_bytes(),
        ],
        bump,
    )]
    pub authority: UncheckedAccount<'info>,

    /// The program account of the pool in which the swap will be performed
    #[account(mut)]
    pub pool_state: AccountLoader<'info, PoolState>,

    /// The user token account for FT mint
    #[account(mut)]
    pub user_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Token vault for the pool
    #[account(
        mut,
        constraint = token_vault.key() == pool_state.load()?.token_vault
    )]
    pub token_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// betting state
    #[account(
        mut,
        constraint = user_betting.load()?.pool_state == pool_state.key() && user_betting.load()?.owner == payer.key()
    )]
    pub user_betting: AccountLoader<'info, BettingState>,

    /// The FT mint
    #[account(
        address = crate::currency::id()
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// The token program
    pub token_program: Program<'info, Token>,
}

pub fn complete(ctx: Context<Complete>) -> Result<()> {
    let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    let pool_id = ctx.accounts.pool_state.key();
    let pool_state = ctx.accounts.pool_state.load()?;
    let user_betting = &mut ctx.accounts.user_betting.load_mut()?;

    // check if timestamp is not passed and result_price is 0
    if user_betting.destination_timestamp > (block_timestamp as u64)
        || user_betting.result_price == 0
        || ctx.bumps.authority != pool_state.auth_bump
    {
        return err!(ErrorCode::NotApproved);
    }

    let actual_transfer_amount = {
        let trade_result = Calculator::calculate_position(
            user_betting.bet_amount.into(),
            pool_state.protocol_fee_rate.into(),
            pool_state.trading_fee_rate.into(),
        )
        .ok_or(ErrorCode::FailedPositionCalculation)?;

        let is_user_win = (user_betting.current_price <= user_betting.result_price
            && TradeDirection::Up.compare(user_betting.trade_direction))
            || (user_betting.current_price >= user_betting.result_price
                && TradeDirection::Down.compare(user_betting.trade_direction));

        let transfer_amount = if is_user_win {
            trade_result
                .without_fee_amount
                .checked_add(trade_result.profit_amount)
                .unwrap()
        } else {
            trade_result
                .without_fee_amount
                .checked_sub(trade_result.profit_amount)
                .unwrap()
        };
        u64::try_from(transfer_amount).unwrap()
    };

    // transfer token back to user
    let auth: &[&[&[u8]]] = &[&[crate::AUTH_SEED.as_bytes(), &[pool_state.auth_bump]]];

    transfer_token(
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.user_account.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        actual_transfer_amount,
        ctx.accounts.token_mint.decimals,
        false,
        auth,
    )?;

    // close betting
    close_account(
        ctx.accounts.user_betting.to_account_info().as_ref(),
        ctx.accounts.payer.to_account_info().as_ref(),
    )?;

    emit!(OrderCompleted {
        betting_id: ctx.accounts.user_betting.key(),
        pool_id: pool_id,
    });

    Ok(())
}
