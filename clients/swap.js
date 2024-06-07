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
const anchor_1 = require("@coral-xyz/anchor");
const utils_1 = require("../tests/utils");
const spl_token_1 = require("@solana/spl-token");
async function main() {
    anchor.setProvider(anchor.AnchorProvider.env());
    const owner = anchor.Wallet.local().payer;
    const program = anchor.workspace.BoosterSwap;
    const confirmOptions = {
        skipPreflight: true,
    };
    const metadata = {
        name: "Just a Test Token",
        symbol: "TEST",
        uri: "https://5vfxc4tr6xoy23qefqbj4qx2adzkzapneebanhcalf7myvn5gzja.arweave.net/7UtxcnH13Y1uBCwCnkL6APKsge0hAgacQFl-zFW9NlI",
        decimals: 9,
    };
    const [mintAuth] = (0, utils_1.getMintAuthAddress)(program.programId);
    let configAddress, poolAddress, poolState;
    async function setup() {
        console.info('[Setup] executing ...');
        const resp = await (0, utils_1.setupSwapTest)(program, owner, mintAuth, metadata, {
            config_index: 0,
            tradeFromTokenZeroToTokenOneFeeRate: new anchor_1.BN(100000),
            tradeFromTokenOneToTokenZeroFeeRate: new anchor_1.BN(100000),
            protocolFeeRate: new anchor_1.BN(0),
            fundFeeRate: new anchor_1.BN(0),
            create_fee: new anchor_1.BN(0),
        }, confirmOptions);
        configAddress = resp.configAddress;
        poolAddress = resp.poolAddress;
        poolState = resp.poolState;
        console.info('[Setup] done');
    }
    async function swapOneForZero() {
        console.log("[Swap One For Zero] executing ...");
        const token0 = poolState.token0Mint;
        const token0AccountBefore = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(program.provider.connection, owner, token0, owner.publicKey);
        const token1AccountBalanceBefore = await program.provider.connection.getBalance(owner.publicKey);
        const token0VaultBefore = await (0, spl_token_1.getAccount)(program.provider.connection, poolState.token0Vault);
        const token1VaultBalanceBefore = await program.provider.connection.getBalance(poolState.token1Vault);
        const amount_in = new anchor_1.BN(100000000);
        const txHash = await (0, utils_1.swap_base_input)(program, owner, configAddress, utils_1.TradeDirection.OneForZero, token0, amount_in, new anchor_1.BN(0), confirmOptions);
        console.info('swap tx hash', txHash);
        const token0AccountAfter = await (0, spl_token_1.getAccount)(program.provider.connection, token0AccountBefore.address);
        const token1BalanceAfter = await program.provider.connection.getBalance(owner.publicKey);
        const token0VaultAfter = await (0, spl_token_1.getAccount)(program.provider.connection, poolState.token0Vault);
        const token1VaultBalanceAfter = await program.provider.connection.getBalance(poolState.token1Vault);
        (0, utils_1.logPairBalance)({
            label: "One For Zero Input-Based account balance change",
            token0BalanceBefore: token0AccountBefore.amount.toString(),
            token1BalanceBefore: token1AccountBalanceBefore,
            token0BalanceAfter: token0AccountAfter.amount.toString(),
            token1BalanceAfter: token1BalanceAfter,
            token0Decimals: metadata.decimals,
            token1Decimals: utils_1.LAMPORTS_PER_SOL_DECIMAL,
        });
        (0, utils_1.logPairBalance)({
            label: "One For Zero Input-Based vault balance change",
            token0BalanceBefore: token0VaultBefore.amount.toString(),
            token1BalanceBefore: token1VaultBalanceBefore,
            token0BalanceAfter: token0VaultAfter.amount.toString(),
            token1BalanceAfter: token1VaultBalanceAfter,
            token0Decimals: metadata.decimals,
            token1Decimals: utils_1.LAMPORTS_PER_SOL_DECIMAL,
        });
        const poolStateAfter = await program.account.poolState.fetch(poolAddress);
        console.log('protocolFeesToken0', poolStateAfter.protocolFeesToken0.toString());
        console.log('protocolFeesToken1', poolStateAfter.protocolFeesToken1.toString());
        console.log('fundFeesToken0', poolStateAfter.fundFeesToken0.toString());
        console.log('fundFeesToken1', poolStateAfter.fundFeesToken1.toString());
        await (0, utils_1.sleep)(1000);
        console.info('[Swap One For Zero] done');
    }
    const getOracle = async () => {
        const oracle = await (0, utils_1.getObservation)(program, poolState.observationKey);
        oracle.filter((o) => !o.blockTimestamp.isZero()).forEach((o) => {
            console.log('oracle blockTimestamp', o.blockTimestamp.toString());
            console.log('oracle cumulativeToken0PriceX32', o.cumulativeToken0PriceX32.toString());
            console.log('oracle cumulativeToken1PriceX32', o.cumulativeToken1PriceX32.toString());
        });
        await (0, utils_1.sleep)(1000);
    };
    const swapZeroForOne = async () => {
        console.info('[Swap Zero For One] executing ...');
        const token0 = poolState.token0Mint;
        const token0AccountBefore = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(program.provider.connection, owner, token0, owner.publicKey);
        const token1AccountBalanceBefore = await program.provider.connection.getBalance(owner.publicKey);
        const token0VaultBefore = await (0, spl_token_1.getAccount)(program.provider.connection, poolState.token0Vault);
        const token1VaultBalanceBefore = await program.provider.connection.getBalance(poolState.token1Vault);
        const amount_in = new anchor_1.BN((0, utils_1.toBigIntQuantity)(2319502, metadata.decimals).toString());
        const txHash = await (0, utils_1.swap_base_input)(program, owner, configAddress, utils_1.TradeDirection.ZeroForOne, token0, amount_in, new anchor_1.BN(0), confirmOptions);
        const token0AccountAfter = await (0, spl_token_1.getAccount)(program.provider.connection, token0AccountBefore.address);
        const token1BalanceAfter = await program.provider.connection.getBalance(owner.publicKey);
        const token0VaultAfter = await (0, spl_token_1.getAccount)(program.provider.connection, poolState.token0Vault);
        const token1VaultBalanceAfter = await program.provider.connection.getBalance(poolState.token1Vault);
        (0, utils_1.logPairBalance)({
            label: "Zero For One Input-Based balance change",
            token0BalanceBefore: token0AccountBefore.amount.toString(),
            token1BalanceBefore: token1AccountBalanceBefore,
            token0BalanceAfter: token0AccountAfter.amount.toString(),
            token1BalanceAfter: token1BalanceAfter,
            token0Decimals: metadata.decimals,
            token1Decimals: utils_1.LAMPORTS_PER_SOL_DECIMAL,
        });
        (0, utils_1.logPairBalance)({
            label: "One For Zero Input-Based vault balance change",
            token0BalanceBefore: token0VaultBefore.amount.toString(),
            token1BalanceBefore: token1VaultBalanceBefore,
            token0BalanceAfter: token0VaultAfter.amount.toString(),
            token1BalanceAfter: token1VaultBalanceAfter,
            token0Decimals: metadata.decimals,
            token1Decimals: utils_1.LAMPORTS_PER_SOL_DECIMAL,
        });
        const poolStateAfter = await program.account.poolState.fetch(poolAddress);
        console.log('protocolFeesToken0', poolStateAfter.protocolFeesToken0.toString());
        console.log('protocolFeesToken1', poolStateAfter.protocolFeesToken1.toString());
        console.log('fundFeesToken0', poolStateAfter.fundFeesToken0.toString());
        console.log('fundFeesToken1', poolStateAfter.fundFeesToken1.toString());
        await (0, utils_1.sleep)(1000);
        console.info('[Swap Zero For One] done');
    };
    await setup();
    await swapOneForZero();
    await swapZeroForOne();
    await getOracle();
}
main();
