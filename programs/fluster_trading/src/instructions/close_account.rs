use std::borrow::Borrow;

use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::{account::*, math::to_decimals, token::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount},
};
// use pyth_sdk_solana::state::SolanaPriceAccount;

#[derive(Accounts)]
pub struct CloseAccount<'info> {
    /// The user performing the DeployPair
    #[account(address = crate::admin::id())]
    pub payer: Signer<'info>,
    /// CHECK: pool vault and lp mint authority
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
    pub system_program: Program<'info, System>,
}

pub fn close_account(_ctx: Context<CloseAccount>) -> Result<()> {
    Ok(())
}
