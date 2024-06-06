use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount},
};

#[derive(Accounts)]
pub struct CloseBetting<'info> {
    /// Payer
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
    #[account(mut, constraint = user_account.mint == token_mint.key())]
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
        constraint = user_betting.load()?.pool_state == pool_state.key() && user_betting.load()?.owner == payer.key() && user_betting.load()?.result_price != 0,
        close = payer
    )]
    pub user_betting: AccountLoader<'info, BettingState>,

    /// The FT mint
    #[account(
        address = crate::currency::id()
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// The token program
    pub token_program: Program<'info, Token>,

    /// system program
    pub system_program: Program<'info, System>,
}

pub fn close_betting(_ctx: Context<CloseBetting>) -> Result<()> {
    Ok(())
}
