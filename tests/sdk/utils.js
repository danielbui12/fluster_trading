"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePriceChange = exports.calculatePercentChange = exports.epochTimeToTimestamp = exports.timestampToEpochTime = exports.sleep = exports.fromBigIntQuantity = exports.toBigIntQuantity = exports.isEqual = void 0;
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
