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
const anchor = __importStar(require("@coral-xyz/anchor"));
const chai_1 = require("chai");
const client_1 = require("@pythnetwork/client");
const wallet_1 = require("./assets/wallet");
const boilerplateReduction_1 = require("utils/boilerplateReduction");
const instructions_1 = require("./sdk/instructions");
const spl_token_1 = require("@solana/spl-token");
const oracle_1 = require("./sdk/oracle");
const web3_js_1 = require("@solana/web3.js");
const sdk_1 = require("@clockwork-xyz/sdk");
const utils_1 = require("./sdk/utils");
const cloclwork_1 = require("./sdk/cloclwork");
describe("Fluster Trading test", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const admin = anchor.Wallet.local().payer;
    const connection = anchor.getProvider().connection;
    const program = anchor.workspace.FlusterTrading;
    const clockworkProvider = sdk_1.ClockworkProvider.fromAnchorProvider(anchor.AnchorProvider.env());
    let authority, poolAddress, 
    // for user mint
    userVault, 
    // for ft mint
    userAccount, 
    // for user mint
    operatorVault, 
    // for ft mint
    operatorAccount, userBettingAddress, userBettingData;
    const { expectIxToSucceed } = (0, boilerplateReduction_1.boilerPlateReduction)(connection, admin);
    describe(" Initialize", () => {
        it("Initialize wSOL pool", async () => {
            const setupInitialize = await (0, instructions_1.initialize)(program, admin, oracle_1.SOL_PRICE_FEED_ID, spl_token_1.NATIVE_MINT, wallet_1.currency.publicKey, {
                trading_fee_rate: 2000, // 20%
                protocol_fee_rate: 100, // 1%
            });
            await expectIxToSucceed(setupInitialize.ix, [admin]);
            authority = setupInitialize.authority;
            poolAddress = setupInitialize.poolAddress;
        });
    });
    describe(" User Action", () => {
        const DEPOSIT_AMOUNT = 10 * web3_js_1.LAMPORTS_PER_SOL;
        const BET_AMOUNT = 100 * web3_js_1.LAMPORTS_PER_SOL;
        it("Deposit", async () => {
            const setupDeposit = await (0, instructions_1.deposit)(program, wallet_1.user, wallet_1.operator, oracle_1.SOL_PRICE_FEED_ID, wallet_1.currency.publicKey, spl_token_1.NATIVE_MINT, spl_token_1.TOKEN_PROGRAM_ID, {
                amount: new anchor.BN(DEPOSIT_AMOUNT), // 20%
            });
            await expectIxToSucceed(setupDeposit.ix, [wallet_1.user, wallet_1.operator]);
            userAccount = setupDeposit.userAccount;
            userVault = setupDeposit.userVault;
            operatorAccount = setupDeposit.operatorAccount;
            operatorVault = setupDeposit.operatorVault;
            const userVaultData = await (0, spl_token_1.getAccount)(connection, userVault);
            console.log('userVaultData.amount', userVaultData.amount);
            const operatorVaultData = await (0, spl_token_1.getAccount)(connection, operatorVault);
            console.log('operatorVaultData.amount', operatorVaultData.amount);
            const userAccountData = await (0, spl_token_1.getAccount)(connection, userAccount);
            console.log('userAccountData.amount', userAccountData.amount);
            const operatorAccountData = await (0, spl_token_1.getAccount)(connection, operatorAccount);
            console.log('operatorAccountData.amount', operatorAccountData.amount);
        });
        it("Betting", async () => {
            const threadId = Math.floor(Math.random() * 1000000);
            const accountData = await connection.getAccountInfo(oracle_1.SOL_PRICE_FEED_ID);
            const priceData = (0, client_1.parsePriceData)(accountData.data);
            const setupBetting = await (0, instructions_1.betting)(program, clockworkProvider, wallet_1.user, spl_token_1.NATIVE_MINT, wallet_1.currency.publicKey, {
                threadId: threadId.toString(),
                amountIn: new anchor.BN(BET_AMOUNT),
                priceSlippage: new anchor.BN((priceData.priceComponents[0].aggregate.priceComponent * 2n).toString()),
                destinationTimestamp: new anchor.BN((0, utils_1.timestampToEpochTime)(Date.now() + (5 * 1000))), // 5 seconds
                tradeDirection: instructions_1.TradeDirection.Up
            });
            await expectIxToSucceed(setupBetting.ix, [wallet_1.user]);
            userBettingAddress = setupBetting.userBettingState;
            userBettingData = await program.account.bettingState.fetch(userBettingAddress);
        });
        it("Wait for revelation", async () => {
            await (0, cloclwork_1.waitForThreadExec)(clockworkProvider, userBettingData.thread);
            userBettingData = await program.account.bettingState.fetch(userBettingAddress);
            console.log(userBettingData);
            console.log('user position price', userBettingData.positionPrice.toString());
            console.log('user result price', userBettingData.resultPrice.toString());
            const is_user_win = (userBettingData.positionPrice.lt(userBettingData.resultPrice)
                && instructions_1.TradeDirection.Up === userBettingData.tradeDirection)
                || (userBettingData.positionPrice.gt(userBettingData.resultPrice)
                    && instructions_1.TradeDirection.Down === userBettingData.tradeDirection);
            console.log(is_user_win ? "user won" : "user lost");
            console.log("Price change", (0, utils_1.calculatePriceChange)(userBettingData.positionPrice.toNumber(), userBettingData.resultPrice.toNumber()), '%');
        });
        it("Complete", async () => {
            const setupComplete = await (0, instructions_1.complete)(program, clockworkProvider, wallet_1.user, spl_token_1.NATIVE_MINT, wallet_1.currency.publicKey);
            const setupCloseBetting = await (0, instructions_1.closeBetting)(program, wallet_1.user, spl_token_1.NATIVE_MINT, wallet_1.currency.publicKey);
            await expectIxToSucceed([
                setupComplete.ix,
                setupCloseBetting.ix
            ], [wallet_1.user]);
            const userAccountData = await (0, spl_token_1.getAccount)(connection, userAccount);
            console.log('userAccountData.amount', userAccountData.amount);
            try {
                await program.account.bettingState.fetch(userBettingAddress);
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.eq(`Account does not exist or has no data ${userBettingAddress}`);
            }
        });
    });
});
