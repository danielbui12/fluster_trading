use crate::error::ErrorCode;
use crate::utils::token::*;
use anchor_lang::prelude::*;
use anchor_spl::token_2022::spl_token_2022;
use std::ops::Deref;

pub fn withdraw(ctx: Context<crate::Deposit>, amount: u64) -> Result<()> {
    let token_vault =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Account>::unpack(
            ctx.accounts
                .token_vault
                .to_account_info()
                .try_borrow_data()?
                .deref(),
        )?
        .base;
    if amount > token_vault.amount {
        return err!(ErrorCode::InvalidAmount);
    }
    transfer_token(
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.user_vault.to_account_info(),
        ctx.accounts.token_vault.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        amount,
        ctx.accounts.token_mint.decimals,
        false,
        &[&[crate::AUTH_SEED.as_bytes(), &[ctx.bumps.authority]]],
    )?;
    msg!(
        "Withdraw {} tokens {} successfully.",
        amount,
        ctx.accounts.token_mint.key()
    );
    Ok(())
}
