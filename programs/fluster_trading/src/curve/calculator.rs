//! calculations

use crate::curve::fees::Fees;
use anchor_lang::Space;

/// The direction of a trade, since curves can be specialized to treat each
/// token differently (by adding offsets or weights)
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum TradeDirection {
    Up,
    Down,
}

impl TradeDirection {
    pub fn from_u8(other: u8) -> TradeDirection {
        match other {
            0 => TradeDirection::Up,
            1 => TradeDirection::Down,
            _ => panic!("Invalid trade direction"),
        }
    }

    pub fn to_enum(other: u8) -> TradeDirection {
        match other {
            0 => TradeDirection::Up,
            1 => TradeDirection::Down,
            _ => panic!("Invalid trade direction"),
        }
    }

    pub fn compare(&self, other: TradeDirection) -> bool {
        match self {
            TradeDirection::Up => other == TradeDirection::Up,
            TradeDirection::Down => other == TradeDirection::Down,
        }
    }

    pub fn compare_u8(&self, other: u8) -> bool {
        match self {
            TradeDirection::Up => other == 0,
            TradeDirection::Down => other == 1,
        }
    }
}

impl Space for TradeDirection {
    const INIT_SPACE: usize = 1;
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

/// Encodes all results of trading from a source token to a destination token
#[derive(Debug, PartialEq)]
pub struct TradeResult {
    /// Amount of tokens going to protocol
    pub protocol_fee: u128,
    /// Amount of profit
    pub profit_amount: u128,
    /// Amount of trading fee
    pub trading_fee: u128,
    /// Amount without fee
    pub without_fee_amount: u128,
}

/// Concrete struct to wrap around the trait object which performs calculation.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Calculator {}

impl Calculator {
    /// Subtract fees and calculate how much the profit is
    /// by default destination is gte than source
    pub fn calculate_position(
        bet_amount: u128,
        protocol_fee_rate: u64,
        trading_fee_rate: u64,
    ) -> Option<TradeResult> {
        // debit the fee to calculate the amount swapped
        let trading_fee = Fees::trading_fee(bet_amount, trading_fee_rate)?;
        let profit_amount = bet_amount.checked_sub(trading_fee).unwrap();
        let protocol_fee = Fees::protocol_fee(profit_amount, protocol_fee_rate)?;
        let without_fee_amount = bet_amount.checked_sub(protocol_fee).unwrap();

        Some(TradeResult {
            protocol_fee,
            profit_amount,
            trading_fee,
            without_fee_amount,
        })
    }
}
