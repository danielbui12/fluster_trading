import { Program, BN } from "@coral-xyz/anchor";
import { FlusterTrading } from "../idl/fluster_trading";
import {
    ConfirmOptions,
    PublicKey,
    Signer,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
    NATIVE_MINT,
    TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
    getAuthAddress,
    getPoolAddress,
    getPoolVaultAddress,
    getUserBettingState,
    getUserVaultAddress,
} from "./pda";
import { ClockworkProvider } from '@clockwork-xyz/sdk'
export const TradeDirection = {
    Up: 0,
    Down: 1,
};
export type TradeDirectionKeyType = keyof typeof TradeDirection;
export type TradeDirectionValueType = typeof TradeDirection[TradeDirectionKeyType];

export async function initialize(
    program: Program<FlusterTrading>,
    payer: Signer,
    tokenOracle: PublicKey,
    tradingToken: PublicKey,
    ftTokenMint: PublicKey,
    config: { trading_fee_rate: number, protocol_fee_rate: number },
    confirmOptions?: ConfirmOptions
) {
    const [poolAddress] = getPoolAddress(
        tradingToken,
        program.programId
    );
    // if (await accountExist(program.provider.connection, poolAddress)) {
    //     return { poolAddress, poolState: await program.account.poolState.fetch(poolAddress) };
    // }

    const [authority] = getAuthAddress(
        program.programId
    );
    const [vault] = getPoolVaultAddress(
        poolAddress,
        ftTokenMint,
        program.programId
    );

    const ix = await program.methods
        .initialize(config.trading_fee_rate, config.protocol_fee_rate)
        .accounts({
            payer: payer.publicKey,
            authority: authority,
            poolState: poolAddress,
            tokenOracle: tokenOracle,
            tradingTokenMint: NATIVE_MINT,
            tokenMint: ftTokenMint,
            tokenVault: vault,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        })
        .instruction();
    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // const poolState = await program.account.poolState.fetch(poolAddress)
    return { ix, poolAddress, authority };
}

export async function deposit(
    program: Program<FlusterTrading>,
    payer: Signer,
    operator: Signer,
    tokenOracle: PublicKey,
    ftTokenMint: PublicKey,
    userTokenMint: PublicKey,
    userTokenProgram: PublicKey,
    config: { amount: BN },
    confirmOptions?: ConfirmOptions,
) {
    const [authority] = getAuthAddress(
        program.programId
    );
    const [userAccount] = getUserVaultAddress(
        payer.publicKey,
        ftTokenMint,
        program.programId
    );
    const userVault = getAssociatedTokenAddressSync(
        userTokenMint,
        payer.publicKey,
    );
    const operatorAccount = getAssociatedTokenAddressSync(
        ftTokenMint,
        operator.publicKey
    );
    const operatorVault = getAssociatedTokenAddressSync(
        userTokenMint,
        operator.publicKey,
    );

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
            destinationTokenProgram: TOKEN_PROGRAM_ID,
            tokenOracle: tokenOracle,
            // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        })
        .instruction();

    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer, operator], undefined, confirmOptions);
    // console.log("deposit tx: ", txHash);
    return { ix, userAccount, userVault, operatorAccount, operatorVault };
}

export async function betting(
    program: Program<FlusterTrading>,
    clockworkProvider: ClockworkProvider,
    payer: Signer,
    tradingToken: PublicKey,
    ftTokenMint: PublicKey,
    config: {
        threadId: string,
        amountIn: BN,
        priceSlippage: BN,
        destinationTimestamp: BN,
        tradeDirection: TradeDirectionValueType
    },
    confirmOptions?: ConfirmOptions,
) {
    const [poolAddress] = getPoolAddress(
        tradingToken,
        program.programId
    );
    const poolState = await program.account.poolState.fetch(poolAddress);
    const [authority] = getAuthAddress(
        program.programId
    );
    const [userAccount] = getUserVaultAddress(
        payer.publicKey,
        ftTokenMint,
        program.programId
    );
    const [vault] = getPoolVaultAddress(
        poolAddress,
        ftTokenMint,
        program.programId
    );
    const [userBettingState] = getUserBettingState(
        payer.publicKey,
        poolAddress,
        program.programId,
    )
    // const [thread] = clockworkProvider.getThreadPDA(
    //     authority,
    //     config.threadId,
    // )

    const ix = await program.methods
        .betting(
            // Buffer.from(config.threadId),
            config.amountIn,
            config.priceSlippage,
            config.destinationTimestamp,
            config.tradeDirection
        )
        .accounts({
            payer: payer.publicKey,
            authority: authority,
            poolState: poolAddress,
            userAccount: userAccount,
            tokenVault: vault,
            userBetting: userBettingState,
            tokenOracle: poolState.tokenOracle,
            tokenMint: ftTokenMint,
            // thread: thread,
            // clockworkProgram: clockworkProvider.threadProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();

    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // console.log("betting tx: ", txHash);
    return { ix, userBettingState };
}

export async function reveal(
    program: Program<FlusterTrading>,
    payer: Signer,
    positionAddress: PublicKey,
    ftTokenMint: PublicKey,
    confirmOptions?: ConfirmOptions,
) {
    const [authority] = getAuthAddress(
        program.programId
    );
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
            tokenMint: ftTokenMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();

    return { ix };
}

export async function complete(
    program: Program<FlusterTrading>,
    clockworkProvider: ClockworkProvider,
    payer: Signer,
    positionAddress: PublicKey,
    ftTokenMint: PublicKey,
    confirmOptions?: ConfirmOptions,
) {
    const [authority] = getAuthAddress(
        program.programId
    );
    const userBettingData = await program.account.bettingState.fetch(positionAddress);
    const [userAccount] = getUserVaultAddress(
        payer.publicKey,
        ftTokenMint,
        program.programId
    );
    const [vault] = getPoolVaultAddress(
        userBettingData.poolState,
        ftTokenMint,
        program.programId
    );

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
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();

    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // console.log("betting tx: ", txHash);
    return { ix };
}

export async function closeBetting(
    program: Program<FlusterTrading>,
    payer: Signer,
    positionAddress: PublicKey,
    ftTokenMint: PublicKey,
    confirmOptions?: ConfirmOptions,
) {
    const [authority] = getAuthAddress(
        program.programId
    );
    const userBettingData = await program.account.bettingState.fetch(positionAddress);
    const [userAccount] = getUserVaultAddress(
        payer.publicKey,
        ftTokenMint,
        program.programId
    );
    const [vault] = getPoolVaultAddress(
        userBettingData.poolState,
        ftTokenMint,
        program.programId
    );

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
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();

    // const txHash = await sendAndConfirmIx(program.provider.connection, [ix], [payer], undefined, confirmOptions);
    // console.log("close betting tx: ", txHash);
    return { ix };
}
