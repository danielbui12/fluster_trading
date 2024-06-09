export const FEE_RATE_DENOMINATOR_VALUE = 10_000;

export function protocolFee(amount: number, protocolFeeRate: number): number {
    return Math.floor(amount * protocolFeeRate / FEE_RATE_DENOMINATOR_VALUE);
}

export function tradingFee(amount: number, tradingFeeRate: number): number {
    return Math.ceil(amount * tradingFeeRate / FEE_RATE_DENOMINATOR_VALUE);
}
