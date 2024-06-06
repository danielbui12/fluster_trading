export function isEqual(amount1: bigint, amount2: bigint) {
    if (
        BigInt(amount1) === BigInt(amount2) ||
        BigInt(amount1) - BigInt(amount2) === BigInt(1) ||
        BigInt(amount1) - BigInt(amount2) === BigInt(-1)
    ) {
        return true;
    }
    return false;
}

export function toBigIntQuantity(quantity: number, decimals: number): bigint {
    return BigInt(quantity) * BigInt(10) ** BigInt(decimals)
}

export function fromBigIntQuantity(quantity: bigint, decimals: number): string {
    return (Number(quantity) / 10 ** decimals).toFixed(6)
}

export const sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}