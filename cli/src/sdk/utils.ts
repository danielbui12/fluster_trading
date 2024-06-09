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

export const timestampToEpochTime = (timestamp: string | number | Date): number => {
    return Math.floor(new Date(timestamp).getTime() / 1000)
}

export const epochTimeToTimestamp = (timestamp: string | number): number => {
    return new Date(Number(timestamp) * 1000).getTime()
}

export const calculatePercentChange = (amount1: number, amount2: number) => {
    return ((amount2 - amount1) * 100 / amount1).toFixed(2)
}
export const calculatePriceChange = (price1: number, price2: number) => {
    if (price1 > price2) {
        return calculatePercentChange(price2, price1)
    } else {
        return calculatePercentChange(price1, price2)
    }
}

export const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export const explorer = ({
    tx,
    account,
    devnet = true
}: {
    tx?: string,
    account?: string,
    devnet?: boolean
}) => {
    let url = `https://explorer.solana.com`
    if (!tx && !account) {
        return ''
    }
    if (account) {
        url = `${url}/account/${account}`
    }
    if (tx) {
        url = `${url}/tx/${tx}`
    }

    if (devnet) {
        url = `${url}?cluster=devnet`
    }
    console.log("Transaction completed:", url);
}

export const calculatePnL = () => {

}