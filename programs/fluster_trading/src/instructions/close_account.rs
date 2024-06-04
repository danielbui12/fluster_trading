use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Token, TokenAccount},
    token_interface::Mint,
};

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
        close = payer
    )]
    pub token_vault: Account<'info, TokenAccount>,

    /// Token mint, the key must smaller then token mint.
    #[account(
        mint::token_program = token_program,
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Program to create mint account and mint tokens
    pub token_program: Program<'info, Token>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn close_account(_ctx: Context<CloseAccount>) -> Result<()> {
    Ok(())
}
