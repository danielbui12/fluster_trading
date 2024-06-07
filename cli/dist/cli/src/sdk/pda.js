"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBettingState = exports.getUserVaultAddress = exports.getPoolVaultAddress = exports.getPoolAddress = exports.getAuthAddress = exports.i32ToBytes = exports.u32ToBytes = exports.i16ToBytes = exports.u16ToBytes = exports.BETTING_STATE_SEED = exports.USER_SEED = exports.POOL_AUTH_SEED = exports.POOL_VAULT_SEED = exports.POOL_SEED = void 0;
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
exports.POOL_SEED = Buffer.from(anchor.utils.bytes.utf8.encode("pool"));
exports.POOL_VAULT_SEED = Buffer.from(anchor.utils.bytes.utf8.encode("pool_vault"));
exports.POOL_AUTH_SEED = Buffer.from(anchor.utils.bytes.utf8.encode("vault_auth_seed"));
exports.USER_SEED = Buffer.from(anchor.utils.bytes.utf8.encode("user_auth_seed"));
exports.BETTING_STATE_SEED = Buffer.from(anchor.utils.bytes.utf8.encode("betting_state"));
function u16ToBytes(num) {
    const arr = new ArrayBuffer(2);
    const view = new DataView(arr);
    view.setUint16(0, num, false);
    return new Uint8Array(arr);
}
exports.u16ToBytes = u16ToBytes;
function i16ToBytes(num) {
    const arr = new ArrayBuffer(2);
    const view = new DataView(arr);
    view.setInt16(0, num, false);
    return new Uint8Array(arr);
}
exports.i16ToBytes = i16ToBytes;
function u32ToBytes(num) {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, num, false);
    return new Uint8Array(arr);
}
exports.u32ToBytes = u32ToBytes;
function i32ToBytes(num) {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setInt32(0, num, false);
    return new Uint8Array(arr);
}
exports.i32ToBytes = i32ToBytes;
function getAuthAddress(programId) {
    const [address, bump] = web3_js_1.PublicKey.findProgramAddressSync([exports.POOL_AUTH_SEED], programId);
    return [address, bump];
}
exports.getAuthAddress = getAuthAddress;
function getPoolAddress(token_mint, programId) {
    const [address, bump] = web3_js_1.PublicKey.findProgramAddressSync([
        exports.POOL_SEED,
        token_mint.toBuffer(),
    ], programId);
    return [address, bump];
}
exports.getPoolAddress = getPoolAddress;
function getPoolVaultAddress(pool, token_mint, programId) {
    const [address, bump] = web3_js_1.PublicKey.findProgramAddressSync([
        exports.POOL_VAULT_SEED,
        pool.toBuffer(),
        token_mint.toBuffer(),
    ], programId);
    return [address, bump];
}
exports.getPoolVaultAddress = getPoolVaultAddress;
function getUserVaultAddress(payer, token_mint, programId) {
    const [address, bump] = web3_js_1.PublicKey.findProgramAddressSync([
        exports.USER_SEED,
        payer.toBuffer(),
        token_mint.toBuffer(),
    ], programId);
    return [address, bump];
}
exports.getUserVaultAddress = getUserVaultAddress;
function getUserBettingState(payer, poolState, programId) {
    const [address, bump] = web3_js_1.PublicKey.findProgramAddressSync([
        exports.BETTING_STATE_SEED,
        poolState.toBuffer(),
        payer.toBuffer(),
    ], programId);
    return [address, bump];
}
exports.getUserBettingState = getUserBettingState;
