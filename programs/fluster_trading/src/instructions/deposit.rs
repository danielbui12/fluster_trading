use crate::utils::{create_token_account, token::transfer_token};
use anchor_lang::prelude::*;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount},
};

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// CHECK: pool vault and token mint authority
    #[account(
        seeds = [
            crate::AUTH_SEED.as_bytes(),
        ],
        bump,
    )]
    pub authority: UncheckedAccount<'info>,
    /// CHECK: user token vault of this program
    #[account(
        mut,
        seeds = [
            crate::USER_SEED.as_bytes(),
            payer.key().as_ref(),
            token_mint.key().as_ref(),
        ],
        bump,
    )]
    pub token_vault: UncheckedAccount<'info>,
    /// user token vault of spl token program
    #[account(
        mut,
        constraint = user_vault.mint == token_mint.key() && user_vault.owner == payer.key(),
    )]
    pub user_vault: Box<InterfaceAccount<'info, TokenAccount>>,
    /// Token mint, the key must smaller then token mint.
    #[account(
        mint::token_program = token_program,
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,
    /// Program to create mint account and mint tokens
    pub token_program: Program<'info, Token>,
    /// payer
    #[account(mut)]
    pub payer: Signer<'info>,
    /// rent program
    pub rent: Sysvar<'info, Rent>,
    /// system program
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    if ctx.accounts.token_vault.get_lamports() == 0 {
        create_token_account(
            &ctx.accounts.authority.to_account_info(),
            &ctx.accounts.payer.to_account_info(),
            &ctx.accounts.token_vault.to_account_info(),
            &ctx.accounts.token_mint.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            &[&[
                crate::USER_SEED.as_bytes(),
                ctx.accounts.payer.key().as_ref(),
                ctx.accounts.token_mint.key().as_ref(),
                &[ctx.bumps.token_vault][..],
            ][..]],
        )?;
    }
    transfer_token(
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.user_vault.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        amount,
        ctx.accounts.token_mint.decimals,
        true,
        &[],
    )?;
    msg!(
        "Deposit {} tokens {} successfully.",
        amount,
        ctx.accounts.token_mint.key()
    );
    Ok(())
}
