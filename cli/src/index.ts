#!/usr/bin/env node

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { CURRENCY, FLUSTER_PROGRAM_ID, MAX_PERCENTAGE, MIN_PERCENTAGE, OPERATOR, PERCENTAGE_PADDING, PERCENT_DENOMINATION } from "./const";
import config from '../config.json';
import fs from 'fs';
import { IDL } from './idl/fluster_trading';
import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { explorer, shortenAddress, timestampToEpochTime } from "./sdk/utils";
import { getUserVaultAddress } from "./sdk/pda";
import { NATIVE_MINT, TOKEN_PROGRAM_ID, createSyncNativeInstruction, createWrappedNativeAccount, getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { TradeDirection, betting, closeBetting, complete, deposit } from "./sdk/instructions";
import { SOL_PRICE_FEED_ID } from "./sdk/oracle";
import { sendAndConfirmIx } from "./sdk/tx";
import { BN } from "bn.js";
import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { parsePriceData } from "@pythnetwork/client";
import { protocolFee } from "./sdk/fee";

const preLoad = () => {
    const key = JSON.parse(fs.readFileSync(config.WALLET_URI, { encoding: 'utf-8' }));
    const wallet = new Wallet(
        Keypair.fromSeed(Uint8Array.from(key.slice(0, 32)))
    );
    const connection = new Connection(config.RPC, config.COMMITMENT as Commitment);
    const provider = new AnchorProvider(connection, wallet, { commitment: config.COMMITMENT as Commitment });
    const program = new Program(IDL, FLUSTER_PROGRAM_ID, provider);
    return {
        connection,
        program,
        provider,
        wallet
    }
}

require('yargs/yargs')(process.argv.slice(2))
    .usage("Usage: npm run fluster <command> [options]  For help: npm run fluster -h")
    .version("0.1.0")
    .help("help")
    .alias("h", "help")
    .command({
        command: 'configure',
        aliases: ['config', 'cfg'],
        desc: 'Set a config variable',
        builder: (yargs) => yargs
            .option('wallet', {
                alias: 'wallet',
                default: "~/.config/solana/id.json",
                describe: 'the wallet keypair file uri'
            }).option('rpc', {
                alias: 'rpc',
                default: "https://api.devnet.solana.com",
                describe: 'rpc cluster url'
            }).option('commitment', {
                alias: 'commitment',
                default: "finalized",
                describe: 'commitment level'
            }).option('slippage', {
                alias: 'slippage',
                default: 1,
                describe: 'slippage tolerance',
                type: 'number'
            })
            .check(argv => {
                if (isNaN(argv.slippage)) {
                    throw new Error('Slippage must be a number');
                }
                if (argv.slippage > MAX_PERCENTAGE || argv.slippage < MIN_PERCENTAGE) {
                    throw new Error('Slippage must be between ' + MIN_PERCENTAGE + ' and ' + MAX_PERCENTAGE);
                }
                return true;
            }),
        handler: (argv) => {
            config.WALLET_URI = argv.wallet;
            config.RPC = argv.rpc;
            config.COMMITMENT = argv.commitment;
            config.SLIPPAGE = argv.slippage * PERCENTAGE_PADDING;
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        }
    })
    .command({
        command: 'view',
        aliases: ['view', 'view'],
        desc: 'view current positions/pools',
        builder: (yargs) => yargs
            .option('type', {
                alias: 't',
                describe: 'choose a type',
                choices: ['position', 'pool']
            })
            .check(argv => {
                if (!argv.type || argv.type !== 'position' && argv.type !== 'pool') {
                    throw new Error('<type> must be a "position" or "pool"');
                }
                return true;
            }),
        handler: async (argv) => {
            const { program, wallet } = preLoad();
            if (argv.type === 'position') {
                // advance filter read more at: https://solanacookbook.com/guides/get-program-accounts.html#filters
                const position = await program.account.bettingState.all()
                const ownerPosition = position.filter((p) => p.account.owner.equals(wallet.publicKey)).map((p) => p.account);
                const poolState = {};
                await Promise.all(ownerPosition.map(async (p) => {
                    if (!poolState[p.poolState.toString()]) {
                        poolState[p.poolState.toString()] = await program.account.poolState.fetch(p.poolState);
                    }
                    const protocolFeeAmount = protocolFee(
                        p.betAmount.toNumber(),
                        poolState[p.poolState.toString()].protocolFeeRate
                    );
                    const tradingFeeAmount = protocolFee(
                        p.betAmount.toNumber(),
                        poolState[p.poolState.toString()].tradingFeeRate
                    );

                    const isUserWin = ('up' in p.tradeDirection && p.resultPrice > p.positionPrice) || (
                        'down' in p.tradeDirection && p.resultPrice < p.positionPrice
                    )

                    const totalPnL = p.resultPrice.toNumber() !== 0 ?
                        (isUserWin ? p.betAmount.toNumber() * 2 - tradingFeeAmount : '-' + (protocolFeeAmount + p.betAmount.toNumber())) :
                        protocolFeeAmount

                    return {
                        poolAddress: shortenAddress(p.poolState.toString()),
                        threadId: shortenAddress(p.thread.toString()),
                        amountIn: p.betAmount.toString(),
                        positionPrice: p.positionPrice.toString(),
                        resultPrice: p.resultPrice.toString(),
                        PnL: totalPnL
                    }
                })).then(console.table);
            } else {
                const pool = await program.account.poolState.all()
                console.table(pool.map((p) => {
                    return {
                        poolAddress: shortenAddress(p.publicKey.toString()),
                        mint: shortenAddress(p.account.mint.toString()),
                        tokenOracle: shortenAddress(p.account.tokenOracle.toString()),
                        status: p.account.status === 0 ? 'open' : 'close',
                        protocolFeeRate: `${(p.account.protocolFeeRate / PERCENTAGE_PADDING)}%`,
                        tradingFeeRate: `${p.account.tradingFeeRate / PERCENTAGE_PADDING}%`
                    }
                }))
            }
        }
    })
    .command({
        command: 'deposit <amount>',
        aliases: ['deposit', 'deposit'],
        desc: 'deposit to account',
        builder: (yargs) => yargs
            .number('amount')
            .check(argv => {
                if (isNaN(argv.amount)) {
                    throw new Error('<amount> must be a number');
                }
                return true;
            }),
        handler: async (argv) => {
            const { program, wallet, connection } = preLoad();
            const depositAmount = argv.amount * LAMPORTS_PER_SOL;
            const tx = new Transaction();
            // wrap some SOLs
            const userNativeAccount = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey);
            try {
                const userNativeAccountData = await getAccount(connection, userNativeAccount,);
                if (userNativeAccountData.amount < depositAmount) {
                    tx.add(
                        SystemProgram.transfer({
                            fromPubkey: wallet.publicKey,
                            toPubkey: userNativeAccount,
                            lamports: BigInt(depositAmount) - userNativeAccountData.amount,
                        }),
                        createSyncNativeInstruction(userNativeAccount, TOKEN_PROGRAM_ID)
                    )
                }
            } catch (error) {
                await createWrappedNativeAccount(
                    connection,
                    wallet.payer,
                    wallet.publicKey,
                    depositAmount,
                );                
            }

            // deposit
            const setupDeposit = await deposit(
                program,
                wallet.payer,
                OPERATOR,
                SOL_PRICE_FEED_ID,
                CURRENCY.publicKey,
                NATIVE_MINT,
                TOKEN_PROGRAM_ID,
                { amount: new BN(depositAmount) }
            );
            tx.add(setupDeposit.ix);
            const txHash = await sendAndConfirmTransaction(connection, tx, [wallet.payer, OPERATOR]);
            explorer({ tx: txHash })
            const newAccountData = (await getAccount(connection, setupDeposit.userAccount))
            console.log("Balance:", newAccountData.amount);
        }
    })
    .command({
        command: 'balance',
        aliases: ['balance', 'balance'],
        desc: 'get balance of account',
        builder: (yargs) => yargs,
        handler: async (argv) => {
            const { wallet, program, connection } = preLoad();
            const [userAccount] = getUserVaultAddress(wallet.publicKey, CURRENCY.publicKey, program.programId);
            try {
                const userAccountData = await getAccount(connection, userAccount);
                console.log("Balance:", userAccountData.amount);
            } catch (error) {
                console.error(error);
                console.log('=====')
            }
        }
    })
    .command({
        command: 'bet <amount_in>',
        aliases: ['bet', 'bet'],
        desc: 'bet',
        builder: (yargs) => yargs
            .option('duration', {
                alias: 'du',
                describe: 'duration time in second',
            })
            .option('direction', {
                alias: 'di',
                describe: 'choose the direction',
                choices: ['Up', 'Down']
            })
            .check(argv => {
                if (isNaN(argv.amount_in)) {
                    throw new Error('<amount_in> must be a number');
                }
                if (isNaN(argv.duration)) {
                    throw new Error('<duration> must be a number');
                }
                if (argv.direction !== 'Up' && argv.direction !== 'Down') {
                    throw new Error('<direction> must be Up or Down');
                } else {
                    argv.direction = TradeDirection[argv.direction]
                }
                return true;
            }),
        handler: async (argv) => {
            const { program, wallet, provider, connection } = preLoad();
            const clockworkProvider = ClockworkProvider.fromAnchorProvider(provider);

            // get current price data -> calculate price slippage
            const accountData = await connection.getAccountInfo(SOL_PRICE_FEED_ID);
            const priceData = parsePriceData(accountData.data);
            const priceComponent = priceData.priceComponents[0].aggregate.priceComponent;
            console.log('current SOL/USD price', priceComponent);
            const priceSlippage = priceComponent * BigInt(PERCENT_DENOMINATION + config.SLIPPAGE) / BigInt(PERCENTAGE_PADDING)
            console.log('max slippage', priceSlippage);
            //
            
            const destinationTimestamp = timestampToEpochTime(Date.now()) + argv.duration_in_second;
            const setupBet = await betting(
                program,
                clockworkProvider,
                wallet.payer,
                NATIVE_MINT,
                CURRENCY.publicKey,
                {
                    threadId: Math.floor(Math.random() * 1_000_000_000).toString(),
                    amountIn: new BN(argv.amount_in * LAMPORTS_PER_SOL),
                    priceSlippage: new BN(priceSlippage.toString()),
                    destinationTimestamp: new BN(destinationTimestamp),
                    tradeDirection: argv.direction
                }
            )
            
            const txHash = await sendAndConfirmIx(connection, [setupBet.ix], [wallet.payer]);
            explorer({ tx: txHash })
        }
    })
    .command({
        command: 'complete',
        aliases: ['complete', 'complete'],
        desc: 'complete the order',
        builder: (yargs) => yargs,
        handler: async (argv) => {
            const { program, provider, wallet } = preLoad();
            const clockworkProvider = ClockworkProvider.fromAnchorProvider(provider);

            const setupComplete = await complete(
                program,
                clockworkProvider,
                wallet.payer,
                NATIVE_MINT,
                CURRENCY.publicKey
            );
            const setUpCloseBetting = await closeBetting(
                program,
                wallet.payer,
                NATIVE_MINT,
                CURRENCY.publicKey
            );

            const txHash = await sendAndConfirmIx(program.provider.connection, [setupComplete.ix, setUpCloseBetting.ix], [wallet.payer]);
            explorer({ tx: txHash })
        }
    })
    .help()
    .argv;
