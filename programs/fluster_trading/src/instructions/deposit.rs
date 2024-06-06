use crate::utils::to_decimals;
use crate::utils::{create_token_account, get_token_price, token::transfer_token};
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount},
};

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// CHECK: authority
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
            destination_token_mint.key().as_ref(),
        ],
        bump,
    )]
    pub user_account: UncheckedAccount<'info>,

    /// user token vault following user token mint
    #[account(
        mut,
        constraint = user_vault.mint == user_token_mint.key() && user_vault.owner == payer.key(),
    )]
    pub user_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// operator token vault following user token mint
    #[account(
        mut,
        constraint = operator_vault.mint == user_token_mint.key() && operator_vault.owner == operator.key(),
    )]
    pub operator_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// operator token vault following FT token mint
    #[account(
        mut,
        constraint = operator_account.mint == destination_token_mint.key() && operator_account.owner == operator.key(),
    )]
    pub operator_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// user token mint
    #[account(
        mint::token_program = user_token_program
    )]
    pub user_token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// FT token mint
    #[account(
        mint::token_program = destination_token_program,
        address = crate::currency::id()
    )]
    pub destination_token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Program to create mint account and mint tokens. Make this separate to support Token 2022 extension
    pub user_token_program: Program<'info, Token>,

    /// Program to create mint account and mint tokens
    pub destination_token_program: Program<'info, Token>,

    /// CHECK: Pyth price feed account of user token mint
    pub token_oracle: UncheckedAccount<'info>,

    /// Program to create an ATA
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// payer
    #[account(mut)]
    pub payer: Signer<'info>,

    /// operator
    #[account(mut)]
    pub operator: Signer<'info>,

    /// rent program
    pub rent: Sysvar<'info, Rent>,

    /// system program
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    if ctx.accounts.user_account.get_lamports() == 0 {
        create_token_account(
            &ctx.accounts.authority.to_account_info(),
            &ctx.accounts.payer.to_account_info(),
            &ctx.accounts.user_account.to_account_info(),
            &ctx.accounts.destination_token_mint.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            &ctx.accounts.destination_token_program.to_account_info(),
            &[&[
                crate::USER_SEED.as_bytes(),
                ctx.accounts.payer.key().as_ref(),
                ctx.accounts.destination_token_mint.key().as_ref(),
                &[ctx.bumps.user_account][..],
            ][..]],
        )?;
    }

    // transfer user_token_mint from user to vault
    transfer_token(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.user_vault.to_account_info(),
        ctx.accounts.operator_vault.to_account_info(),
        ctx.accounts.user_token_mint.to_account_info(),
        ctx.accounts.user_token_program.to_account_info(),
        amount,
        ctx.accounts.user_token_mint.decimals,
        true,
        &[],
    )?;

    // transfer FT mint from vault to user account
    let (price, expo) = get_token_price(block_timestamp, ctx.accounts.token_oracle.as_ref());
    let actual_receive_amount = u64::try_from(
        // try to convert to u128 to prevent overflow
        u128::try_from(price)
            .unwrap()
            .checked_mul(
                to_decimals(1u64, ctx.accounts.destination_token_mint.decimals.into()).into(),
            )
            .and_then(|r| r.checked_div(to_decimals(1u64, expo.into()).into()))
            .and_then(|r| r.checked_mul(amount.into()))
            .and_then(|r| {
                r.checked_div(
                    to_decimals(1u64, ctx.accounts.user_token_mint.decimals.into()).into(),
                )
            })
            .unwrap(),
    )
    .unwrap();

    transfer_token(
        ctx.accounts.operator.to_account_info(),
        ctx.accounts.user_account.to_account_info(),
        ctx.accounts.operator_account.to_account_info(),
        ctx.accounts.destination_token_mint.to_account_info(),
        ctx.accounts.destination_token_program.to_account_info(),
        actual_receive_amount,
        ctx.accounts.destination_token_mint.decimals,
        false,
        &[],
    )?;

    #[cfg(feature = "enable-log")]
    msg!(
        "Deposit {} mint {} and receive {} FT successfully.",
        amount,
        ctx.accounts.user_token_mint.key(),
        actual_receive_amount
    );
    Ok(())
}
