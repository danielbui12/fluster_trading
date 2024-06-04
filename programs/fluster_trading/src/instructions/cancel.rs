use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::close_account;
use crate::utils::transfer_token;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;

pub fn cancel(ctx: Context<crate::Reveal>) -> Result<()> {
    let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    let pool_id = ctx.accounts.pool_state.key();
    let pool_state = ctx.accounts.pool_state.load()?;
    let user_betting = &mut ctx.accounts.user_betting.load_mut()?;

    // check if timestamp is not passed and result_price is not 0
    if user_betting.destination_timestamp < (block_timestamp as u64)
        || user_betting.result_price != 0
    {
        return err!(ErrorCode::NotApproved);
    }

    // close thread
    clockwork_sdk::cpi::thread_delete(CpiContext::new_with_signer(
        ctx.accounts.clockwork_program.to_account_info(),
        clockwork_sdk::cpi::ThreadDelete {
            authority: ctx.accounts.authority.to_account_info(),
            close_to: ctx.accounts.payer.to_account_info(),
            thread: ctx.accounts.thread.to_account_info(),
        },
        &[&[crate::AUTH_SEED.as_bytes(), &[pool_state.auth_bump]]],
    ))?;

    // transfer token back to user
    let auth: &[&[&[u8]]] = &[&[crate::AUTH_SEED.as_bytes(), &[pool_state.auth_bump]]];
    transfer_token(
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.token_account.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        user_betting.bet_amount,
        ctx.accounts.token_mint.decimals,
        false,
        auth,
    )?;

    // close betting
    close_account(
        ctx.accounts.user_betting.to_account_info().as_ref(),
        ctx.accounts.payer.to_account_info().as_ref(),
    )?;

    emit!(OrderCancelled {
        betting_id: ctx.accounts.user_betting.key(),
        pool_id: pool_id,
    });

    Ok(())
}
