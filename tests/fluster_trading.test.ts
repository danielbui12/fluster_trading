import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { parsePriceData } from "@pythnetwork/client";
import { currency, operator, user } from "./assets/wallet";
import { boilerPlateReduction } from "utils/boilerplateReduction";
import { FlusterTrading } from "target/types/fluster_trading";
import { TradeDirection, betting, closeBetting, complete, deposit, initialize } from "./sdk/instructions";
import { NATIVE_MINT, TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { SOL_PRICE_FEED_ID } from "./sdk/oracle";
import { Betting } from "./sdk/type";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { calculatePriceChange, timestampToEpochTime } from "./sdk/utils";
import { waitForThreadExec } from "./sdk/cloclwork";

describe("Fluster Trading test", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const admin = anchor.Wallet.local().payer;
    const connection = anchor.getProvider().connection;
    const program = anchor.workspace.FlusterTrading as anchor.Program<FlusterTrading>;
    const clockworkProvider = ClockworkProvider.fromAnchorProvider(anchor.AnchorProvider.env());

    let authority: anchor.web3.PublicKey,
        poolAddress: anchor.web3.PublicKey,
        // for user mint
        userVault: anchor.web3.PublicKey,
        // for ft mint
        userAccount: anchor.web3.PublicKey,
        // for user mint
        operatorVault: anchor.web3.PublicKey,
        // for ft mint
        operatorAccount: anchor.web3.PublicKey,
        userBettingAddress: anchor.web3.PublicKey,
        userBettingData: Betting;

    const {
        expectIxToSucceed
    } = boilerPlateReduction(connection, admin);

    describe(" Initialize", () => {
        it("Initialize wSOL pool", async () => {
            const setupInitialize = await initialize(
                program,
                admin,
                SOL_PRICE_FEED_ID,
                NATIVE_MINT,
                currency.publicKey,
                {
                    trading_fee_rate: 2000, // 20%
                    protocol_fee_rate: 100, // 1%
                }
            );
            await expectIxToSucceed(
                setupInitialize.ix,
                [admin]
            )
            authority = setupInitialize.authority;
            poolAddress = setupInitialize.poolAddress;
        })
    })

    describe(" User Action", () => {
        const DEPOSIT_AMOUNT = 10 * LAMPORTS_PER_SOL;
        const BET_AMOUNT = 100 * LAMPORTS_PER_SOL;

        it("Deposit", async () => {
            const setupDeposit = await deposit(
                program,
                user,
                operator,
                SOL_PRICE_FEED_ID,
                currency.publicKey,
                NATIVE_MINT,
                TOKEN_PROGRAM_ID,
                {
                    amount: new anchor.BN(DEPOSIT_AMOUNT), // 20%
                }
            );
            await expectIxToSucceed(
                setupDeposit.ix,
                [user, operator]
            );
            userAccount = setupDeposit.userAccount;
            userVault = setupDeposit.userVault;
            operatorAccount = setupDeposit.operatorAccount;
            operatorVault = setupDeposit.operatorVault;

            const userVaultData = await getAccount(connection, userVault);
            console.log('userVaultData.amount', userVaultData.amount);

            const operatorVaultData = await getAccount(connection, operatorVault);
            console.log('operatorVaultData.amount', operatorVaultData.amount);

            const userAccountData = await getAccount(connection, userAccount);
            console.log('userAccountData.amount', userAccountData.amount);

            const operatorAccountData = await getAccount(connection, operatorAccount);
            console.log('operatorAccountData.amount', operatorAccountData.amount);
        });

        it("Betting", async () => {
            const threadId = Math.floor(Math.random() * 1_000_000);
            const accountData = await connection.getAccountInfo(SOL_PRICE_FEED_ID);
            const priceData = parsePriceData(accountData.data);

            const setupBetting = await betting(
                program,
                clockworkProvider,
                user,
                NATIVE_MINT,
                currency.publicKey,
                {
                    threadId: threadId.toString(),
                    amountIn: new anchor.BN(BET_AMOUNT),
                    priceSlippage: new anchor.BN((priceData.priceComponents[0].aggregate.priceComponent * 2n).toString()),
                    destinationTimestamp: new anchor.BN(timestampToEpochTime(Date.now() + (5 * 1000))), // 5 seconds
                    tradeDirection: TradeDirection.Up
                }
            );
            await expectIxToSucceed(
                setupBetting.ix,
                [user],
            );
            userBettingAddress = setupBetting.userBettingState;
            userBettingData = await program.account.bettingState.fetch(userBettingAddress) as unknown as Betting;
        });

        it("Wait for revelation", async () => {
            await waitForThreadExec(clockworkProvider, userBettingData.thread);
            userBettingData = await program.account.bettingState.fetch(userBettingAddress) as unknown as Betting;
            console.log(userBettingData);

            console.log('user position price', userBettingData.positionPrice.toString());
            console.log('user result price', userBettingData.resultPrice.toString());

            const is_user_win = (userBettingData.positionPrice.lt(userBettingData.resultPrice)
                && TradeDirection.Up === userBettingData.tradeDirection)
                || (userBettingData.positionPrice.gt(userBettingData.resultPrice)
                    && TradeDirection.Down === userBettingData.tradeDirection);
            console.log(
                is_user_win ? "user won" : "user lost"
            )
            console.log("Price change", calculatePriceChange(userBettingData.positionPrice.toNumber(), userBettingData.resultPrice.toNumber()), '%')
        });

        it("Complete", async () => {
            const setupComplete = await complete(
                program,
                clockworkProvider,
                user,
                NATIVE_MINT,
                currency.publicKey,
            )
            const setupCloseBetting = await closeBetting(
                program,
                user,
                NATIVE_MINT,
                currency.publicKey,
            )
            await expectIxToSucceed([
                setupComplete.ix,
                setupCloseBetting.ix
            ], [user]);
            const userAccountData = await getAccount(connection, userAccount);
            console.log('userAccountData.amount', userAccountData.amount);

            try {
                await program.account.bettingState.fetch(userBettingAddress);
            } catch (error) {
                expect(error.message).to.be.eq(`Account does not exist or has no data ${userBettingAddress}`)
            }
        });


        it("Betting again", async () => {
            const threadId = Math.floor(Math.random() * 1_000_000);
            const accountData = await connection.getAccountInfo(SOL_PRICE_FEED_ID);
            const priceData = parsePriceData(accountData.data);

            const setupBetting = await betting(
                program,
                clockworkProvider,
                user,
                NATIVE_MINT,
                currency.publicKey,
                {
                    threadId: threadId.toString(),
                    amountIn: new anchor.BN(BET_AMOUNT),
                    priceSlippage: new anchor.BN((priceData.priceComponents[0].aggregate.priceComponent * 2n).toString()),
                    destinationTimestamp: new anchor.BN(timestampToEpochTime(Date.now() + (5 * 1000))), // 5 seconds
                    tradeDirection: TradeDirection.Up
                }
            );
            await expectIxToSucceed(
                setupBetting.ix,
                [user],
            );
            userBettingAddress = setupBetting.userBettingState;
            userBettingData = await program.account.bettingState.fetch(userBettingAddress) as unknown as Betting;
        });
    })
});
