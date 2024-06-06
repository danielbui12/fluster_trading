use crate::error::ErrorCode;
use crate::states::*;
// use crate::utils::close_account;
use crate::utils::transfer_token;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount},
};
use clockwork_sdk::state::Thread;

#[derive(Accounts)]
pub struct Cancel<'info> {
    /// Payer
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The user performing the trading
    #[account(mut, address = user_betting.load()?.owner)]
    pub owner: SystemAccount<'info>,

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

    /// The user token account for token
    #[account(
        mut,
        seeds = [
            crate::USER_SEED.as_bytes(),
            payer.key().as_ref(),
            token_mint.key().as_ref(),
        ],
        bump,
    )]
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
        constraint = user_betting.load()?.pool_state == pool_state.key()
    )]
    pub user_betting: AccountLoader<'info, BettingState>,

    /// The thread to reset.
    #[account(mut, constraint = thread.authority.eq(&authority.key()))]
    pub thread: Account<'info, Thread>,

    /// The Clockwork thread program.
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>,

    /// CHECK: token oracle
    #[account(
        address = pool_state.load()?.token_oracle
    )]
    pub token_oracle: AccountInfo<'info>,

    /// The FT mint
    #[account(
        address = crate::currency::id()
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// The token program
    pub token_program: Program<'info, Token>,

    /// The system program
    pub system_program: Program<'info, System>,
}

pub fn cancel(ctx: Context<crate::Cancel>) -> Result<()> {
    let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    let pool_id = ctx.accounts.pool_state.key();
    let pool_state = ctx.accounts.pool_state.load()?;
    let user_betting = &mut ctx.accounts.user_betting.load()?;

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
        ctx.accounts.user_account.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        user_betting.bet_amount,
        ctx.accounts.token_mint.decimals,
        false,
        auth,
    )?;

    // // close betting
    // close_account(
    //     ctx.accounts.user_betting.to_account_info().as_ref(),
    //     ctx.accounts.owner.to_account_info().as_ref(),
    // )?;

    emit!(OrderCancelled {
        betting_id: ctx.accounts.user_betting.key(),
        pool_id: pool_id,
    });

    Ok(())
}
