"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomInt = exports.sleepSeconds = exports.boilerPlateReduction = exports.programIdFromEnvVar = exports.range = void 0;
const web3_js_1 = require("@solana/web3.js");
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
(0, chai_1.use)(chai_as_promised_1.default);
//prevent chai from truncating error messages
chai_1.config.truncateThreshold = 0;
const range = (size) => [...Array(size).keys()];
exports.range = range;
function programIdFromEnvVar(envVar) {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} environment variable not set`);
    }
    try {
        return new web3_js_1.PublicKey(process.env[envVar]);
    }
    catch (e) {
        throw new Error(`${envVar} environment variable is not a valid program id - value: ${process.env[envVar]}`);
    }
}
exports.programIdFromEnvVar = programIdFromEnvVar;
class SendIxError extends Error {
    constructor(originalError) {
        //The newlines don't actually show up correctly in chai's assertion error, but at least
        // we have all the information and can just replace '\n' with a newline manually to see
        // what's happening without having to change the code.
        const logs = originalError.logs?.join("\n") || "error had no logs";
        super(originalError.message + "\nlogs:\n" + logs);
        this.stack = originalError.stack;
        this.logs = logs;
    }
}
const boilerPlateReduction = (connection, defaultSigner) => {
    // for signing wormhole messages
    const defaultNodeWallet = web3_js_1.Keypair.fromSecretKey(defaultSigner.secretKey);
    const payerToWallet = (payer) => !payer || payer === defaultSigner
        ? defaultNodeWallet
        : web3_js_1.Keypair.fromSecretKey(payer.secretKey);
    const requestAirdrop = async (account) => connection.confirmTransaction(await connection.requestAirdrop(account, 1000 * web3_js_1.LAMPORTS_PER_SOL));
    const sendAndConfirmIx = async (ix, signerOrSignersOrComputeUnits, computeUnits) => {
        let [signers, units] = (() => {
            if (!signerOrSignersOrComputeUnits)
                return [[defaultSigner], computeUnits];
            if (typeof signerOrSignersOrComputeUnits === "number") {
                if (computeUnits !== undefined)
                    throw new Error("computeUnits can't be specified twice");
                return [[defaultSigner], signerOrSignersOrComputeUnits];
            }
            return [
                Array.isArray(signerOrSignersOrComputeUnits)
                    ? signerOrSignersOrComputeUnits
                    : [signerOrSignersOrComputeUnits],
                computeUnits,
            ];
        })();
        const tx = new web3_js_1.Transaction();
        const unwrapIx = await ix;
        if (Array.isArray(unwrapIx)) {
            tx.add(...unwrapIx);
        }
        else {
            tx.add(unwrapIx);
        }
        if (units)
            tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units }));
        try {
            console.log('sending transaction');
            return await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, signers);
        }
        catch (error) {
            throw new SendIxError(error);
        }
    };
    const expectIxToSucceed = async (ix, signerOrSignersOrComputeUnits, computeUnits) => (0, chai_1.expect)(sendAndConfirmIx(ix, signerOrSignersOrComputeUnits, computeUnits)).to
        .be.fulfilled;
    const expectIxToFailWithError = async (ix, errorMessage, signerOrSignersOrComputeUnits, computeUnits) => {
        try {
            await sendAndConfirmIx(ix, signerOrSignersOrComputeUnits, computeUnits);
        }
        catch (error) {
            (0, chai_1.expect)(error.logs).includes(errorMessage);
            return;
        }
        chai_1.expect.fail("Expected transaction to fail");
    };
    const expectTxToSucceed = async (tx, payer) => {
        const wallet = payerToWallet(payer);
        return (0, chai_1.expect)((0, web3_js_1.sendAndConfirmTransaction)(connection, await tx, [wallet])).to.be.fulfilled;
    };
    return {
        requestAirdrop,
        sendAndConfirmIx,
        expectIxToSucceed,
        expectIxToFailWithError,
        expectTxToSucceed,
    };
};
exports.boilerPlateReduction = boilerPlateReduction;
const sleepSeconds = async (s) => await new Promise((f) => setTimeout(f, s * 1000));
exports.sleepSeconds = sleepSeconds;
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.getRandomInt = getRandomInt;
