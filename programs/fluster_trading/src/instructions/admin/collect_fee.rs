use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::token::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use anchor_spl::token_interface::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct CollectFee<'info> {
    /// Only admin can collect fee now
    #[account(constraint = payer.key() == crate::admin::id() @ ErrorCode::InvalidOwner)]
    pub payer: Signer<'info>,

    /// CHECK: pool vault and lp mint authority
    #[account(
        seeds = [
            crate::AUTH_SEED.as_bytes(),
        ],
        bump,
    )]
    pub authority: UncheckedAccount<'info>,

    /// Pool state stores accumulated protocol fee amount
    #[account(mut)]
    pub pool_state: AccountLoader<'info, PoolState>,

    /// The address that holds pool tokens
    #[account(
        mut,
        constraint = token_vault.key() == pool_state.load()?.token_vault
    )]
    pub token_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The mint of token vault
    #[account(
        address = token_vault.mint
    )]
    pub vault_mint: Box<InterfaceAccount<'info, Mint>>,

    /// The address that receives the collected token_0 protocol fees
    #[account(mut)]
    pub recipient_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The SPL program to perform token transfers
    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

pub fn collect_fee(ctx: Context<CollectFee>, amount_requested: u64) -> Result<()> {
    let pool_state = ctx.accounts.pool_state.load()?;
    if pool_state.auth_bump != ctx.bumps.authority {
        return err!(ErrorCode::NotApproved);
    }
    let amount = amount_requested.min(ctx.accounts.token_vault.amount);

    transfer_token(
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.recipient_token_account.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.vault_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        amount,
        ctx.accounts.vault_mint.decimals,
        false,
        &[&[crate::AUTH_SEED.as_bytes(), &[pool_state.auth_bump]]],
    )?;

    Ok(())
}
