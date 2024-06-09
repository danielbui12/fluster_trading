"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradingFee = exports.protocolFee = exports.FEE_RATE_DENOMINATOR_VALUE = void 0;
exports.FEE_RATE_DENOMINATOR_VALUE = 10000;
function protocolFee(amount, protocolFeeRate) {
    return Math.floor(amount * protocolFeeRate / exports.FEE_RATE_DENOMINATOR_VALUE);
}
exports.protocolFee = protocolFee;
function tradingFee(amount, tradingFeeRate) {
    return Math.ceil(amount * tradingFeeRate / exports.FEE_RATE_DENOMINATOR_VALUE);
}
exports.tradingFee = tradingFee;
