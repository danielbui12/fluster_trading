import * as anchor from "@coral-xyz/anchor";
import { expect, use as chaiUse } from "chai";
import chaiAsPromised from 'chai-as-promised';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    createMint,
    createWrappedNativeAccount,
    getAccount,
    getMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import { boilerPlateReduction } from "utils/boilerplateReduction";
import { currency, operator, user } from "./assets/wallet";
import { sleep } from "./sdk/utils";

chaiUse(chaiAsPromised);

describe(" 0: Setup Environment", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const admin = anchor.Wallet.local().payer;

    console.log("admin: ", admin.publicKey.toString());
    console.log("operator: ", operator.publicKey.toString());
    console.log("user:", user.publicKey.toString());
    console.log("currency:", currency.publicKey.toString());
    const accounts = [admin, operator, user];

    const connection = anchor.getProvider().connection;

    const {
        requestAirdrop,
    } = boilerPlateReduction(connection, admin);

    before("Airdrop", async function () {
        await Promise.all(accounts.map((kp) => kp.publicKey).map(requestAirdrop));
    });

    it("Check balance", async function () {
        await Promise.all(accounts.map(async (kp) => {
            const balance = await connection.getBalance(kp.publicKey);
            expect(balance).to.be.gte(1000 * LAMPORTS_PER_SOL);
        }))
    });

    it('Creating Assets', async () => {
        const DECIMALs = 9;
        const mint = await createMint(
            connection,
            admin,
            admin.publicKey,
            null, // freezeAuthority
            DECIMALs,
            currency,
        );
        expect(mint).deep.equals(currency.publicKey);

        const { decimals } = await getMint(connection, mint);
        expect(decimals).equals(DECIMALs);
    });

    it("Create ATA & mint for operator", async function () {
        const operatorAta = await getOrCreateAssociatedTokenAccount(connection, operator, currency.publicKey, operator.publicKey)
        await sleep(1000);

        const mintAmount = 1_000_000_000 * LAMPORTS_PER_SOL;
        await expect(
            mintTo(
                connection,
                operator,
                currency.publicKey,
                operatorAta.address,
                admin.publicKey,
                mintAmount,
                [admin, operator]
            )
        ).to.be.fulfilled;

        const { amount } = await getAccount(connection, operatorAta.address);
        expect(amount.toString()).equals(mintAmount.toString());
    });

    it("Wrap some SOL", async function () {
        const wrapAmount = 10 * LAMPORTS_PER_SOL;
        await Promise.all(accounts.map(async (kp) => {
            const wSolUserPubkey = await createWrappedNativeAccount(
                connection,
                kp,
                kp.publicKey,
                wrapAmount,
            );
            const wSolAccount = await getAccount(connection, wSolUserPubkey)
            expect(wSolAccount.amount.toString()).to.be.eq(wrapAmount.toString())
        }))
    });
})