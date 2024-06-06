import { PublicKey } from "@solana/web3.js";

export interface PoolState {
    /// mint account
    mint: PublicKey,
    /// Token oracle account
    token_oracle: PublicKey,
    /// Token
    token_vault: PublicKey,
    /// main authority bump
    auth_bump: number,
    /// Bitwise representation of the state of the pool
    /// bit0, 1: disable deposit(value is 1), 0: normal
    /// bit1, 1: disable withdraw(value is 2), 0: normal
    /// bit2, 1: disable swap(value is 4), 0: normal
    status: number,
    /// The protocol fee. DENOMINATOR: 10_000 aka 100%
    protocol_fee_rate: number,
    /// The trading fee. DENOMINATOR: 10_000 aka 100%
    trading_fee_rate: number,
}