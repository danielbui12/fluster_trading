import { TradeDirectionValueType } from './instructions';
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface PoolState {
    /// mint account
    mint: PublicKey,
    /// Token oracle account
    tokenOracle: PublicKey,
    /// Token
    tokenVault: PublicKey,
    /// main authority bump
    authBump: number,
    /// Bitwise representation of the state of the pool
    /// bit0, 1: disable deposit(value is 1), 0: normal
    /// bit1, 1: disable withdraw(value is 2), 0: normal
    /// bit2, 1: disable swap(value is 4), 0: normal
    status: number,
    /// The protocol fee. DENOMINATOR: 10_000 aka 100%
    protocolFeeRate: number,
    /// The trading fee. DENOMINATOR: 10_000 aka 100%
    tradingFeeRate: number,
}

export interface Betting {
    /// Which betting belongs
    poolState: PublicKey,
    /// Which betting belongs
    thread: PublicKey,
    /// owner of this account
    owner: PublicKey,
    /// amount of bet
    betAmount: BN,
    /// trade_direction
    tradeDirection: TradeDirectionValueType,
    /// current price
    positionPrice: BN,
    /// destination timestamp
    destinationTimestamp: BN,
    /// current price
    resultPrice: BN,
}