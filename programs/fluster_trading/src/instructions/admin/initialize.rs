use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::*;
use anchor_lang::{accounts::interface_account::InterfaceAccount, prelude::*};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::Token, // token_2022::spl_token_2022,
    token_interface::Mint,
};
// use spl_memo::solana_program::program_pack::Pack;
// use std::ops::Deref;

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// Address paying to create the pool. Can be anyone
    #[account(mut, constraint = payer.key() == crate::admin::id() @ ErrorCode::InvalidOwner)]
    pub payer: Signer<'info>,

    /// CHECK: pool vault and token mint authority
    #[account(
        seeds = [
            crate::AUTH_SEED.as_bytes(),
        ],
        bump,
    )]
    pub authority: UncheckedAccount<'info>,

    /// Initialize an account to store the pool state
    #[account(
        init,
        seeds = [
            POOL_SEED.as_bytes(),
            token_mint.key().as_ref(),
        ],
        bump,
        payer = payer,
        space = 8 + PoolState::INIT_SPACE
    )]
    pub pool_state: AccountLoader<'info, PoolState>,

    /// CHECK: Token oracle
    #[account(mut)]
    pub token_oracle: UncheckedAccount<'info>,

    /// Token mint
    #[account(
        mint::token_program = token_program,
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: Token vault for the pool
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED.as_bytes(),
            pool_state.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
    )]
    pub token_vault: UncheckedAccount<'info>,
    /// Program to create mint account and mint tokens
    pub token_program: Program<'info, Token>,
    /// Program to create an ATA
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// To create a new program account
    pub system_program: Program<'info, System>,
    /// Sysvar for program account
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize(
    ctx: Context<Initialize>,
    trading_fee_rate: u16,
    protocol_fee_rate: u16,
) -> Result<()> {
    if !is_supported_mint(&ctx.accounts.token_mint).unwrap() {
        return err!(ErrorCode::NotSupportMint);
    }

    create_token_account(
        &ctx.accounts.authority.to_account_info(),
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.token_vault.to_account_info(),
        &ctx.accounts.token_mint.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &[&[
            POOL_VAULT_SEED.as_bytes(),
            ctx.accounts.pool_state.key().as_ref(),
            ctx.accounts.token_mint.key().as_ref(),
            &[ctx.bumps.token_vault][..],
        ][..]],
    )?;

    // let token_vault =
    //     spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Account>::unpack(
    //         ctx.accounts
    //             .token_vault
    //             .to_account_info()
    //             .try_borrow_data()?
    //             .deref(),
    //     )?
    //     .base;

    let pool_state = &mut ctx.accounts.pool_state.load_init()?;

    pool_state.initialize(
        ctx.bumps.authority,
        trading_fee_rate,
        protocol_fee_rate,
        ctx.accounts.token_vault.key(),
        ctx.accounts.token_oracle.key(),
        ctx.accounts.token_mint.key(),
    );

    emit!(PoolInitialized {
        pool_id: ctx.accounts.pool_state.key(),
        token_oracle: ctx.accounts.token_oracle.key(),
    });

    Ok(())
}
