"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockTimestamp = exports.sendTransaction = exports.accountExist = void 0;
const web3_js_1 = require("@solana/web3.js");
async function accountExist(connection, account) {
    const info = await connection.getAccountInfo(account);
    console.log(info);
    if (info == null || info.data.length == 0) {
        return false;
    }
    return true;
}
exports.accountExist = accountExist;
async function sendTransaction(connection, ixs, signers, options) {
    const tx = new web3_js_1.Transaction();
    for (var i = 0; i < ixs.length; i++) {
        tx.add(ixs[i]);
    }
    if (options == undefined) {
        options = {
            preflightCommitment: "confirmed",
            commitment: "confirmed",
        };
    }
    const sendOpt = options && {
        skipPreflight: options.skipPreflight,
        preflightCommitment: options.preflightCommitment || options.commitment,
    };
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signature = await connection.sendTransaction(tx, signers, sendOpt);
    const status = (await connection.confirmTransaction(signature, options.commitment)).value;
    if (status.err) {
        throw new Error(`Raw transaction ${signature} failed (${JSON.stringify(status)})`);
    }
    return signature;
}
exports.sendTransaction = sendTransaction;
async function getBlockTimestamp(connection) {
    let slot = await connection.getSlot();
    return await connection.getBlockTime(slot);
}
exports.getBlockTimestamp = getBlockTimestamp;
