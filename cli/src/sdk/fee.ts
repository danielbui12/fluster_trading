import {
    MAX_FEE_BASIS_POINTS,
    ONE_IN_BASIS_POINTS,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const FEE_RATE_DENOMINATOR_VALUE = 10_000;

export function protocolFee(amount: number, protocolFeeRate: number): number {
    return Math.floor(amount * protocolFeeRate / FEE_RATE_DENOMINATOR_VALUE);
}

export function tradingFee(amount: number, tradingFeeRate: number): number {
    return Math.ceil(amount * tradingFeeRate / FEE_RATE_DENOMINATOR_VALUE);
}
