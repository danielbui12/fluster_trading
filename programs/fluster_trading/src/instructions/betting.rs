use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::{token::*, math::from_decimals};
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount}
};
use pyth_sdk_solana::state::SolanaPriceAccount;

#[derive(Accounts)]
pub struct Betting<'info> {
    /// The user performing the trading
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: pool vault and lp mint authority
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
    pub token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    
    /// Token vault for the pool
    #[account(
        mut,
        constraint = token_vault.key() == pool_state.load()?.token_vault
    )]
    pub token_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// betting state
    #[account(
        init_if_needed,
        seeds = [
            BETTING_STATE_SEED.as_bytes(),
            pool_state.key().as_ref(),
            payer.key().as_ref(),
        ],
        bump,
        space = 8 + BettingState::INIT_SPACE,
        payer = payer,
    )]
    user_betting: AccountLoader<'info, BettingState>,
    /// CHECK: token oracle
    #[account(
        address = pool_state.load()?.token_oracle
    )]
    token_oracle: AccountInfo<'info>,
    /// The mint of token
    #[account(
        address = pool_state.load()?.token_mint 
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// The mint of token_0
    #[account(
        address = pool_state.load()?.token_program
    )]    
    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

pub fn betting(
    ctx: Context<Betting>,
    trade_direction: u8,
    leverage: u8,
    amount_in: u64,
    duration: u64,
) -> Result<()> {
    let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    let pool_id = ctx.accounts.pool_state.key();
    let pool_state = &mut ctx.accounts.pool_state.load()?;
    if !pool_state.get_status_by_bit(PoolStatusBitIndex::Bet) || pool_state.max_leverage < leverage || leverage == 0
    {
        return err!(ErrorCode::NotApproved);
    }
    let actual_amount = amount_in.checked_div(leverage as u64).unwrap();
    require_gt!(actual_amount, 0);

    transfer_token(
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.token_account.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        actual_amount,
        ctx.accounts.token_mint.decimals,
        true,
        &[&[crate::AUTH_SEED.as_bytes(), &[pool_state.auth_bump]]],
    )?;

    let current_token_price = {
        // invoke Pyth program to get token price
        const STALENESS_THRESHOLD: u64 = 10; // staleness threshold in seconds
        let price_feed = SolanaPriceAccount::account_info_to_feed(
            &ctx.accounts.token_oracle.to_account_info()
        ).unwrap();
        let current_price = price_feed
            .get_price_no_older_than(block_timestamp, STALENESS_THRESHOLD)
            .unwrap();
        let display_price = from_decimals(
            u64::try_from(current_price.price).unwrap(),
            u32::try_from(-current_price.expo).unwrap()
        );
        #[cfg(feature = "enable-log")]
        msg!("current_price:{}", display_price);
        u64::try_from(current_price.price).unwrap()
    };

    let user_betting = &mut ctx.accounts.user_betting.load_init()?;
    user_betting.initialize(
        trade_direction,
        amount_in,
        pool_id,
        leverage,
        current_token_price,
        (block_timestamp as u64).checked_add(duration).unwrap()
    );

    emit!(OrderPlaced {
        betting_id: ctx.accounts.user_betting.key(),
        pool_id: pool_id,
        token_vault_before: ctx.accounts.token_vault.amount,
        trade_direction: trade_direction,
        amount_in: amount_in,
        leverage: leverage,
        duration: duration,
    });

    Ok(())
}
