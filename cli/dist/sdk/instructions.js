"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeBetting = exports.complete = exports.reveal = exports.betting = exports.deposit = exports.initialize = exports.TradeDirection = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const pda_1 = require("./pda");
const oracle_1 = require("./oracle");
exports.TradeDirection = {
    Up: 0,
    Down: 1,
};
async function initialize(program, payer, tokenOracle, tradingToken, ftTokenMint, config, confirmOptions) {
    const [poolAddress] = (0, pda_1.getPoolAddress)(tradingToken, program.programId);
    // if (await accountExist(program.provider.connection, poolAddress)) {
    //     return { poolAddress, poolState: await program.account.poolState.fetch(poolAddress) };
    // }
    const [authority] = (0, pda_1.getAuthAddress)(program.programId);
    const [vault] = (0, pda_1.getPoolVaultAddress)(poolAddress, ftTokenMint, program.programId);
    const ix = await program.methods
        .initialize(config.trading_fee_rate, config.protocol_fee_rate)
        .accounts({
        payer: payer.publicKey,
        authority: authority,
        poolState: poolAddress,
        tokenOracle: tokenOracle,
        tradingTokenMint: spl_token_1.NATIVE_MINT,
        tokenMint: ftTokenMint,
        tokenVault: vault,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
    })
        .instruction();
    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // const poolState = await program.account.poolState.fetch(poolAddress)
    return { ix, poolAddress, authority };
}
exports.initialize = initialize;
async function deposit(program, payer, operator, tokenOracle, ftTokenMint, userTokenMint, userTokenProgram, config, confirmOptions) {
    const [authority] = (0, pda_1.getAuthAddress)(program.programId);
    const [userAccount] = (0, pda_1.getUserVaultAddress)(payer.publicKey, ftTokenMint, program.programId);
    const userVault = (0, spl_token_1.getAssociatedTokenAddressSync)(userTokenMint, payer.publicKey);
    const operatorAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(ftTokenMint, operator.publicKey);
    const operatorVault = (0, spl_token_1.getAssociatedTokenAddressSync)(userTokenMint, operator.publicKey);
    const ix = await program.methods
        .deposit(config.amount)
        .accounts({
        payer: payer.publicKey,
        operator: operator.publicKey,
        authority: authority,
        userAccount: userAccount,
        userVault: userVault,
        operatorAccount: operatorAccount,
        operatorVault: operatorVault,
        userTokenMint: userTokenMint,
        userTokenProgram: userTokenProgram,
        destinationTokenMint: ftTokenMint,
        destinationTokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        tokenOracle: tokenOracle,
        tokenOracleProgram: oracle_1.CHAINLINK_PROGRAM_ID,
        // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
    })
        .instruction();
    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer, operator], undefined, confirmOptions);
    // console.log("deposit tx: ", txHash);
    return { ix, userAccount, userVault, operatorAccount, operatorVault };
}
exports.deposit = deposit;
async function betting(program, clockworkProvider, payer, poolAddress, ftTokenMint, config, confirmOptions) {
    const poolState = await program.account.poolState.fetch(poolAddress);
    const [authority] = (0, pda_1.getAuthAddress)(program.programId);
    const [userAccount] = (0, pda_1.getUserVaultAddress)(payer.publicKey, ftTokenMint, program.programId);
    const [vault] = (0, pda_1.getPoolVaultAddress)(poolAddress, ftTokenMint, program.programId);
    const [userBettingState] = (0, pda_1.getUserBettingState)(payer.publicKey, poolAddress, program.programId);
    // const [thread] = clockworkProvider.getThreadPDA(
    //     authority,
    //     config.threadId,
    // )
    const ix = await program.methods
        .betting(
    // Buffer.from(config.threadId),
    config.amountIn, config.priceSlippage, config.destinationTimestamp, config.tradeDirection)
        .accounts({
        payer: payer.publicKey,
        authority: authority,
        poolState: poolAddress,
        userAccount: userAccount,
        tokenVault: vault,
        userBetting: userBettingState,
        tokenOracle: poolState.tokenOracle,
        tokenOracleProgram: oracle_1.CHAINLINK_PROGRAM_ID,
        tokenMint: ftTokenMint,
        // thread: thread,
        // clockworkProgram: clockworkProvider.threadProgram.programId,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // console.log("betting tx: ", txHash);
    return { ix, userBettingState };
}
exports.betting = betting;
async function reveal(program, payer, positionAddress, ftTokenMint, confirmOptions) {
    const [authority] = (0, pda_1.getAuthAddress)(program.programId);
    const userBettingData = await program.account.bettingState.fetch(positionAddress);
    const poolStateData = await program.account.poolState.fetch(userBettingData.poolState);
    const ix = await program.methods
        .reveal()
        .accounts({
        payer: payer.publicKey,
        owner: userBettingData.owner,
        authority: authority,
        poolState: userBettingData.poolState,
        userBetting: positionAddress,
        tokenOracle: poolStateData.tokenOracle,
        tokenOracleProgram: oracle_1.CHAINLINK_PROGRAM_ID,
        tokenMint: ftTokenMint,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    return { ix };
}
exports.reveal = reveal;
async function complete(program, clockworkProvider, payer, positionAddress, ftTokenMint, confirmOptions) {
    const [authority] = (0, pda_1.getAuthAddress)(program.programId);
    const userBettingData = await program.account.bettingState.fetch(positionAddress);
    const [userAccount] = (0, pda_1.getUserVaultAddress)(payer.publicKey, ftTokenMint, program.programId);
    const [vault] = (0, pda_1.getPoolVaultAddress)(userBettingData.poolState, ftTokenMint, program.programId);
    const ix = await program.methods
        .complete()
        .accounts({
        payer: payer.publicKey,
        owner: userBettingData.owner,
        authority: authority,
        poolState: userBettingData.poolState,
        userAccount: userAccount,
        tokenVault: vault,
        userBetting: positionAddress,
        tokenMint: ftTokenMint,
        // thread: userBettingData.thread,
        // clockworkProgram: clockworkProvider.threadProgram.programId,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // console.log("betting tx: ", txHash);
    return { ix };
}
exports.complete = complete;
async function closeBetting(program, payer, positionAddress, ftTokenMint, confirmOptions) {
    const [authority] = (0, pda_1.getAuthAddress)(program.programId);
    const userBettingData = await program.account.bettingState.fetch(positionAddress);
    const [userAccount] = (0, pda_1.getUserVaultAddress)(payer.publicKey, ftTokenMint, program.programId);
    const [vault] = (0, pda_1.getPoolVaultAddress)(userBettingData.poolState, ftTokenMint, program.programId);
    const ix = await program.methods
        .closeBetting()
        .accounts({
        payer: payer.publicKey,
        authority: authority,
        poolState: userBettingData.poolState,
        userAccount: userAccount,
        tokenVault: vault,
        userBetting: positionAddress,
        tokenMint: ftTokenMint,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // console.log("close betting tx: ", txHash);
    return { ix };
}
exports.closeBetting = closeBetting;
