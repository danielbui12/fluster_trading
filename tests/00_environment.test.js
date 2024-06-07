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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const boilerplateReduction_1 = require("utils/boilerplateReduction");
const wallet_1 = require("./assets/wallet");
const utils_1 = require("./sdk/utils");
(0, chai_1.use)(chai_as_promised_1.default);
describe(" 0: Setup Environment", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const admin = anchor.Wallet.local().payer;
    console.log("admin: ", admin.publicKey.toString());
    console.log("operator: ", wallet_1.operator.publicKey.toString());
    console.log("user:", wallet_1.user.publicKey.toString());
    console.log("currency:", wallet_1.currency.publicKey.toString());
    const accounts = [admin, wallet_1.operator, wallet_1.user];
    const connection = anchor.getProvider().connection;
    const { requestAirdrop, } = (0, boilerplateReduction_1.boilerPlateReduction)(connection, admin);
    before("Airdrop", async function () {
        await Promise.all(accounts.map((kp) => kp.publicKey).map(requestAirdrop));
    });
    it("Check balance", async function () {
        await Promise.all(accounts.map(async (kp) => {
            const balance = await connection.getBalance(kp.publicKey);
            (0, chai_1.expect)(balance).to.be.gte(1000 * web3_js_1.LAMPORTS_PER_SOL);
        }));
    });
    it('Creating Assets', async () => {
        const DECIMALs = 9;
        const mint = await (0, spl_token_1.createMint)(connection, admin, admin.publicKey, null, // freezeAuthority
        DECIMALs, wallet_1.currency);
        (0, chai_1.expect)(mint).deep.equals(wallet_1.currency.publicKey);
        const { decimals } = await (0, spl_token_1.getMint)(connection, mint);
        (0, chai_1.expect)(decimals).equals(DECIMALs);
    });
    it("Create ATA & mint for operator", async function () {
        const operatorAta = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, wallet_1.operator, wallet_1.currency.publicKey, wallet_1.operator.publicKey);
        await (0, utils_1.sleep)(1000);
        const mintAmount = 1000000000 * web3_js_1.LAMPORTS_PER_SOL;
        await (0, chai_1.expect)((0, spl_token_1.mintTo)(connection, wallet_1.operator, wallet_1.currency.publicKey, operatorAta.address, admin.publicKey, mintAmount, [admin, wallet_1.operator])).to.be.fulfilled;
        const { amount } = await (0, spl_token_1.getAccount)(connection, operatorAta.address);
        (0, chai_1.expect)(amount.toString()).equals(mintAmount.toString());
    });
    it("Wrap some SOL", async function () {
        const wrapAmount = 10 * web3_js_1.LAMPORTS_PER_SOL;
        await Promise.all(accounts.map(async (kp) => {
            const wSolUserPubkey = await (0, spl_token_1.createWrappedNativeAccount)(connection, kp, kp.publicKey, wrapAmount);
            const wSolAccount = await (0, spl_token_1.getAccount)(connection, wSolUserPubkey);
            (0, chai_1.expect)(wSolAccount.amount.toString()).to.be.eq(wrapAmount.toString());
        }));
    });
});
