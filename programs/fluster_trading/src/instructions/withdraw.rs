use crate::error::ErrorCode;
use crate::utils::{to_decimals, token::*};
use anchor_lang::prelude::*;
// use anchor_lang::solana_program;
use anchor_spl::token_2022::spl_token_2022;
use std::ops::Deref;

/// withdraw based on user_token_mint
pub fn withdraw(ctx: Context<crate::Deposit>, amount: u64) -> Result<()> {
    // let block_timestamp = solana_program::clock::Clock::get()?.unix_timestamp;
    // calculate actual amount
    let (price, expo) = get_token_price_from_chainlink(
      ctx.accounts.token_oracle_program.as_ref(),
      ctx.accounts.token_oracle.as_ref()
    );
    let actual_receive_amount = u64::try_from(
        // try to convert to u128 to prevent overflow
        u128::try_from(price)
            .unwrap()
            .checked_mul(
                to_decimals(1u64, ctx.accounts.destination_token_mint.decimals.into()).into(),
            )
            .and_then(|r| r.checked_div(to_decimals(1u64, expo.into()).into()))
            .and_then(|r| r.checked_mul(amount.into()))
            .unwrap(),
    )
    .unwrap();
    let user_account =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Account>::unpack(
            ctx.accounts
                .user_account
                .to_account_info()
                .try_borrow_data()?
                .deref(),
        )?
        .base;
    if actual_receive_amount > user_account.amount {
        return err!(ErrorCode::InvalidAmount);
    }

    // transfer user_token_mint from vault to user
    transfer_token(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.user_vault.to_account_info(),
        ctx.accounts.operator_vault.to_account_info(),
        ctx.accounts.user_token_mint.to_account_info(),
        ctx.accounts.user_token_program.to_account_info(),
        amount,
        ctx.accounts.user_token_mint.decimals,
        false,
        &[],
    )?;
    // transfer FT mint from destination_user to destination_vault account
    transfer_token(
        ctx.accounts.operator.to_account_info(),
        ctx.accounts.user_account.to_account_info(),
        ctx.accounts.operator_account.to_account_info(),
        ctx.accounts.destination_token_mint.to_account_info(),
        ctx.accounts.destination_token_program.to_account_info(),
        actual_receive_amount,
        ctx.accounts.destination_token_mint.decimals,
        true,
        &[],
    )?;

    #[cfg(feature = "enable-log")]
    msg!(
        "Withdraw {} FT and receive {} mint {} successfully.",
        actual_receive_amount,
        amount,
        ctx.accounts.user_token_mint.key()
    );
    Ok(())
}
