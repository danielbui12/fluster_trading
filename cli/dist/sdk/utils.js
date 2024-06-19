"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePnL = exports.explorer = exports.shortenAddress = exports.calculatePriceChange = exports.calculatePercentChange = exports.epochTimeToTimestamp = exports.timestampToEpochTime = exports.sleep = exports.fromBigIntQuantity = exports.toBigIntQuantity = exports.isEqual = void 0;
function isEqual(amount1, amount2) {
    if (BigInt(amount1) === BigInt(amount2) ||
        BigInt(amount1) - BigInt(amount2) === BigInt(1) ||
        BigInt(amount1) - BigInt(amount2) === BigInt(-1)) {
        return true;
    }
    return false;
}
exports.isEqual = isEqual;
function toBigIntQuantity(quantity, decimals) {
    return BigInt(quantity) * BigInt(10) ** BigInt(decimals);
}
exports.toBigIntQuantity = toBigIntQuantity;
function fromBigIntQuantity(quantity, decimals) {
    return (Number(quantity) / 10 ** decimals).toFixed(6);
}
exports.fromBigIntQuantity = fromBigIntQuantity;
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const timestampToEpochTime = (timestamp) => {
    return Math.floor(new Date(timestamp).getTime() / 1000);
};
exports.timestampToEpochTime = timestampToEpochTime;
const epochTimeToTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).getTime();
};
exports.epochTimeToTimestamp = epochTimeToTimestamp;
const calculatePercentChange = (amount1, amount2) => {
    return ((amount2 - amount1) * 100 / amount1).toFixed(2);
};
exports.calculatePercentChange = calculatePercentChange;
const calculatePriceChange = (price1, price2) => {
    if (price1 > price2) {
        return (0, exports.calculatePercentChange)(price2, price1);
    }
    else {
        return (0, exports.calculatePercentChange)(price1, price2);
    }
};
exports.calculatePriceChange = calculatePriceChange;
const shortenAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
exports.shortenAddress = shortenAddress;
const explorer = ({ tx, account, devnet = true }) => {
    let url = `https://explorer.solana.com`;
    if (!tx && !account) {
        return '';
    }
    if (account) {
        url = `${url}/account/${account}`;
    }
    if (tx) {
        url = `${url}/tx/${tx}`;
    }
    if (devnet) {
        url = `${url}?cluster=devnet`;
    }
    console.log("Transaction completed:", url);
};
exports.explorer = explorer;
const calculatePnL = () => {
};
exports.calculatePnL = calculatePnL;
