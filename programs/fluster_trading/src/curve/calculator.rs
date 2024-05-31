//! Swap calculations

use crate::curve::{constant_product::ConstantProductCurve, fees::Fees};
use anchor_lang::prelude::*;
use {crate::error::ErrorCode, std::fmt::Debug};

/// Helper function for mapping to ErrorCode::CalculationFailure
pub fn map_zero_to_none(x: u128) -> Option<u128> {
    if x == 0 {
        None
    } else {
        Some(x)
    }
}

/// The direction of a trade, since curves can be specialized to treat each
/// token differently (by adding offsets or weights)
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum TradeDirection {
    Up,
    Down,
}

impl Default for TradeDirection {
    fn default() -> Self {
        TradeDirection::Up
    }
}

/// The direction to round.  Used for pool token to trading token conversions to
/// avoid losing value on any deposit or withdrawal.
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum RoundDirection {
    /// Floor the value, ie. 1.9 => 1, 1.1 => 1, 1.5 => 1
    Floor,
    /// Ceiling the value, ie. 1.9 => 2, 1.1 => 2, 1.5 => 2
    Ceiling,
}

impl TradeDirection {
    pub fn compare(&self, other: u8) -> bool {
        match self {
            TradeDirection::Up => other == 0,
            TradeDirection::Down => other == 1,
        }
    }

    pub fn to_enum(other: u8) -> TradeDirection {
        match other {
            0 => TradeDirection::Up,
            1 => TradeDirection::Down,
            _ => panic!("Invalid trade direction"),
        }
    }
}

/// Encodes results of depositing both sides at once
#[derive(Debug, PartialEq)]
pub struct TradingTokenResult {
    /// Amount of token A
    pub token_0_amount: u128,
    /// Amount of token B
    pub token_1_amount: u128,
}

/// Encodes all results of swapping from a source token to a destination token
#[derive(Debug, PartialEq)]
pub struct SwapResult {
    /// New amount of source token
    pub new_swap_source_amount: u128,
    /// New amount of destination token
    pub new_swap_destination_amount: u128,
    /// Amount of source token swapped (includes fees)
    pub source_amount_swapped: u128,
    /// Amount of destination token swapped
    pub destination_amount_swapped: u128,
    /// Amount of extra native SOL pay for vault when swap from SOL -> Token
    pub margin_trade_fee: u128,
    /// Amount of less native SOL pay for user when swap from Token -> SOL
    pub padding_trade_fee: u128,
    /// Amount of source tokens going to protocol
    pub protocol_fee: u128,
    /// Amount of source tokens going to protocol team
    pub fund_fee: u128,
}

/// Concrete struct to wrap around the trait object which performs calculation.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct CurveCalculator {}

impl CurveCalculator {
    /// Subtract fees and calculate how much destination token will be provided
    /// given an amount of source token.
    pub fn swap_base_input(
        source_amount: u128,
        swap_source_amount: u128,
        swap_destination_amount: u128,
        trade_fee_rate: u64,
        protocol_fee_rate: u64,
        fund_fee_rate: u64,
    ) -> Option<SwapResult> {
        // debit the fee to calculate the amount swapped
        let margin_trade_fee = Fees::trading_fee(source_amount, trade_fee_rate)?;
        let protocol_fee = Fees::protocol_fee(margin_trade_fee, protocol_fee_rate)?;
        let fund_fee = Fees::fund_fee(margin_trade_fee, fund_fee_rate)?;

        let destination_amount_swapped = ConstantProductCurve::swap_base_input_without_fees(
            source_amount,
            swap_source_amount,
            swap_destination_amount,
        );
        let padding_trade_fee = Fees::trading_fee(destination_amount_swapped, trade_fee_rate)?;

        Some(SwapResult {
            new_swap_source_amount: swap_source_amount.checked_add(source_amount)?,
            new_swap_destination_amount: swap_destination_amount
                .checked_sub(destination_amount_swapped)?,
            source_amount_swapped: source_amount,
            destination_amount_swapped,
            margin_trade_fee,
            padding_trade_fee,
            protocol_fee,
            fund_fee,
        })
    }

    pub fn swap_base_output(
        destination_amount: u128,
        swap_source_amount: u128,
        swap_destination_amount: u128,
        trade_fee_rate: u64,
        protocol_fee_rate: u64,
        fund_fee_rate: u64,
    ) -> Option<SwapResult> {
        let source_amount_swapped = ConstantProductCurve::swap_base_output_without_fees(
            destination_amount,
            swap_source_amount,
            swap_destination_amount,
        );

        let margin_trade_fee = Fees::trading_fee(source_amount_swapped, trade_fee_rate)?;
        let protocol_fee = Fees::protocol_fee(margin_trade_fee, protocol_fee_rate)?;
        let fund_fee = Fees::fund_fee(margin_trade_fee, fund_fee_rate)?;
        let padding_trade_fee = Fees::trading_fee(destination_amount, trade_fee_rate)?;

        Some(SwapResult {
            new_swap_source_amount: swap_source_amount.checked_add(source_amount_swapped)?,
            new_swap_destination_amount: swap_destination_amount.checked_sub(destination_amount)?,
            source_amount_swapped,
            destination_amount_swapped: destination_amount,
            margin_trade_fee,
            padding_trade_fee,
            protocol_fee,
            fund_fee,
        })
    }

    /// Get the amount of trading tokens for the given amount of pool tokens,
    /// provided the total trading tokens and supply of pool tokens.
    pub fn lp_tokens_to_trading_tokens(
        lp_token_amount: u128,
        lp_token_supply: u128,
        swap_token_0_amount: u128,
        swap_token_1_amount: u128,
        round_direction: RoundDirection,
    ) -> Option<TradingTokenResult> {
        ConstantProductCurve::lp_tokens_to_trading_tokens(
            lp_token_amount,
            lp_token_supply,
            swap_token_0_amount,
            swap_token_1_amount,
            round_direction,
        )
    }
}
