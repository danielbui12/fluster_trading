use crate::curve::{Fees, TradeDirection};
use crate::error::ErrorCode;
use crate::states::*;
use crate::utils::token::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_lang::InstructionData;
use anchor_spl::{
    token::Token,
    token_interface::{Mint, TokenAccount},
};
use clockwork_sdk::state::Thread;
use spl_memo::solana_program::instruction::Instruction;

#[derive(Accounts)]
#[instruction(thread_id: Vec<u8>)]
pub struct Betting<'info> {
    /// The user performing the trading
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

    /// Token vault of the pool
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
    pub user_betting: AccountLoader<'info, BettingState>,

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

    /// Address to assign to the newly created thread.
    #[account(mut, address = Thread::pubkey(authority.key(), thread_id))]
    pub thread: SystemAccount<'info>,

    /// The Clockwork thread program.
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>,

    /// The token program
    pub token_program: Program<'info, Token>,

    /// system program
    pub system_program: Program<'info, System>,
}

pub fn betting(
    ctx: Context<Betting>,
    thread_id: Vec<u8>,
    amount_in: u64,
    price_slippage: u64,
    destination_timestamp: i64,
    trade_direction: u8,
) -> Result<()> {
    let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    let pool_id = ctx.accounts.pool_state.key();
    let pool_state = &mut ctx.accounts.pool_state.load()?;
    if !pool_state.get_status_by_bit(PoolStatusBitIndex::Bet)
        || destination_timestamp < block_timestamp
        || ctx.bumps.authority != pool_state.auth_bump
    {
        return err!(ErrorCode::NotApproved);
    }
    require_gt!(amount_in, 0, ErrorCode::InvalidAmount);
    let protocol_fee =
        Fees::protocol_fee(amount_in.into(), pool_state.protocol_fee_rate.into()).unwrap();
    let actual_amount = amount_in
        .checked_add(u64::try_from(protocol_fee).unwrap())
        .unwrap();

    let current_token_price = {
        let (price, _) = get_token_price(block_timestamp, ctx.accounts.token_oracle.as_ref());
        u64::try_from(price).unwrap()
    };

    if TradeDirection::Up.compare_u8(trade_direction) && current_token_price > price_slippage
        || TradeDirection::Down.compare_u8(trade_direction) && current_token_price < price_slippage
    {
        return err!(ErrorCode::ExceededSlippage);
    }

    let auth: &[&[&[u8]]] = &[&[crate::AUTH_SEED.as_bytes(), &[pool_state.auth_bump]]];
    transfer_token(
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.user_account.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        actual_amount,
        ctx.accounts.token_mint.decimals,
        true,
        auth,
    )?;

    let user_betting = &mut ctx.accounts.user_betting.load_init()?;
    user_betting.initialize(
        pool_id,
        ctx.accounts.payer.key(),
        trade_direction,
        amount_in,
        current_token_price,
        destination_timestamp as u64,
    );

    // 1️⃣ Prepare an instruction to be automated.
    let target_ix = Instruction {
        program_id: crate::id(),
        accounts: crate::accounts::Reveal {
            payer: ctx.accounts.payer.key(),
            authority: ctx.accounts.authority.key(),
            pool_state: ctx.accounts.pool_state.key(),
            user_betting: ctx.accounts.user_betting.key(),
            thread: ctx.accounts.thread.key(),
            clockwork_program: ctx.accounts.clockwork_program.key(),
            token_oracle: ctx.accounts.token_oracle.key(),
            token_mint: ctx.accounts.token_mint.key(),
            token_program: ctx.accounts.token_program.key(),
            system_program: ctx.accounts.system_program.key(),
        }
        .to_account_metas(Some(true)),
        data: crate::instruction::Reveal {}.data(),
    };
    let trigger = clockwork_sdk::state::Trigger::Timestamp {
        unix_ts: destination_timestamp,
    };
    clockwork_sdk::cpi::thread_create(
        CpiContext::new_with_signer(
            ctx.accounts.clockwork_program.to_account_info(),
            clockwork_sdk::cpi::ThreadCreate {
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                thread: ctx.accounts.thread.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            &auth,
        ),
        crate::CLOCK_WORK_FEE,
        thread_id.clone(),
        vec![target_ix.into()],
        trigger,
    )?;

    emit!(OrderPlaced {
        betting_id: ctx.accounts.user_betting.key(),
        pool_id: pool_id,
        token_vault: ctx.accounts.token_vault.amount,
        trade_direction: trade_direction,
        amount_in: amount_in,
        destination_timestamp: destination_timestamp as u64,
        thread_id
    });

    Ok(())
}
