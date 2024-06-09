use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::get_token_price;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::{token::Token, token_interface::Mint};
// use clockwork_sdk::state::Thread;

#[derive(Accounts)]
pub struct Reveal<'info> {
    /// The user performing the trading
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The owner performing the trading
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

    /// betting state
    #[account(
        mut,
        constraint = user_betting.load()?.pool_state == pool_state.key()
    )]
    pub user_betting: AccountLoader<'info, BettingState>,

    // /// The thread to reset.
    // #[account(mut, address = user_betting.load()?.thread)]
    // pub thread: Account<'info, Thread>,
    //
    // /// The Clockwork thread program.
    // #[account(address = clockwork_sdk::ID)]
    // pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>,
    //
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

pub fn reveal(ctx: Context<Reveal>) -> Result<()> {
    let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    let pool_id = ctx.accounts.pool_state.key();
    let user_betting = &mut ctx.accounts.user_betting.load_mut()?;

    // check if timestamp is passed and result_price is not 0
    if user_betting.destination_timestamp > (block_timestamp as u64)
        || user_betting.result_price != 0
    {
        return err!(ErrorCode::NotApproved);
    }

    #[cfg(feature = "enable-log")]
    msg!("Thread triggered");

    let current_token_price = {
        let (price, _) = get_token_price(block_timestamp, ctx.accounts.token_oracle.as_ref());
        u64::try_from(price).unwrap()
    };
    user_betting.result_price = current_token_price;

    // reentrancy error
    // clockwork_sdk::cpi::thread_delete(CpiContext::new_with_signer(
    //     ctx.accounts.clockwork_program.to_account_info(),
    //     clockwork_sdk::cpi::ThreadDelete {
    //         authority: ctx.accounts.authority.to_account_info(),
    //         close_to: ctx.accounts.owner.to_account_info(),
    //         thread: ctx.accounts.thread.to_account_info(),
    //     },
    //     &[&[crate::AUTH_SEED.as_bytes(), &[pool_state.auth_bump]]],
    // ))?;

    emit!(OrderFulfilled {
        betting_id: ctx.accounts.user_betting.key(),
        pool_id: pool_id,
        result: current_token_price,
    });

    Ok(())
}
