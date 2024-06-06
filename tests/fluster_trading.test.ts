import * as anchor from "@coral-xyz/anchor";
import { assert, expect } from "chai";
import { parsePriceData } from "@pythnetwork/client";
import CurrencyKeyPair from "./assets/currency.json";
import { currency, operator, user } from "./assets/wallet";
import { boilerPlateReduction } from "utils/boilerplateReduction";
import { FlusterTrading } from "target/types/fluster_trading";
import { deposit, initialize } from "./sdk/instructions";
import { NATIVE_MINT, TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { SOL_PRICE_FEED_ID } from "./sdk/oracle";
import { PoolState } from "./sdk/type";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("Fluster Trading test", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const admin = anchor.Wallet.local().payer;
    const connection = anchor.getProvider().connection;
    const program = anchor.workspace.FlusterTrading as anchor.Program<FlusterTrading>;
    let poolAddress: anchor.web3.PublicKey,
        poolState: PoolState,
        // for user mint
        userVault: anchor.web3.PublicKey,
        // for ft mint
        userAccount: anchor.web3.PublicKey,
        // for user mint
        operatorVault: anchor.web3.PublicKey,
        // for ft mint
        operatorAccount: anchor.web3.PublicKey;

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
                {
                    trading_fee_rate: 2000, // 20%
                    protocol_fee_rate: 100, // 1%
                }
            );
            await expectIxToSucceed(
                setupInitialize.ix,
                [admin]
            )
            poolAddress = setupInitialize.poolAddress;
            poolState = await program.account.poolState.fetch(poolAddress) as unknown as PoolState;
        })
    })

    describe(" User Action", () => {
        const DEPOSIT_AMOUNT = 10 * LAMPORTS_PER_SOL;
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

        })
    })

});
