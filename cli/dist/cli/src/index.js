#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@coral-xyz/anchor");
const const_1 = require("./const");
const config_json_1 = __importDefault(require("../config.json"));
const fs_1 = __importDefault(require("fs"));
const fluster_trading_1 = require("./idl/fluster_trading");
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./sdk/utils");
const pda_1 = require("./sdk/pda");
const spl_token_1 = require("@solana/spl-token");
const instructions_1 = require("./sdk/instructions");
const oracle_1 = require("./sdk/oracle");
const tx_1 = require("./sdk/tx");
const bn_js_1 = require("bn.js");
const sdk_1 = require("@clockwork-xyz/sdk");
const client_1 = require("@pythnetwork/client");
const fee_1 = require("./sdk/fee");
const web3_1 = require("./sdk/web3");
const cloclwork_1 = require("./sdk/cloclwork");
const preLoad = () => {
    const key = JSON.parse(fs_1.default.readFileSync(config_json_1.default.WALLET_URI, { encoding: 'utf-8' }));
    const wallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSeed(Uint8Array.from(key.slice(0, 32))));
    const connection = new web3_js_1.Connection(config_json_1.default.RPC, config_json_1.default.COMMITMENT);
    const provider = new anchor_1.AnchorProvider(connection, wallet, { commitment: config_json_1.default.COMMITMENT });
    const program = new anchor_1.Program(fluster_trading_1.IDL, const_1.FLUSTER_PROGRAM_ID, provider);
    return {
        connection,
        program,
        provider,
        wallet
    };
};
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
        if (argv.slippage > const_1.MAX_PERCENTAGE || argv.slippage < const_1.MIN_PERCENTAGE) {
            throw new Error('Slippage must be between ' + const_1.MIN_PERCENTAGE + ' and ' + const_1.MAX_PERCENTAGE);
        }
        return true;
    }),
    handler: (argv) => {
        config_json_1.default.WALLET_URI = argv.wallet;
        config_json_1.default.RPC = argv.rpc;
        config_json_1.default.COMMITMENT = argv.commitment;
        config_json_1.default.SLIPPAGE = argv.slippage * const_1.PERCENTAGE_PADDING;
        fs_1.default.writeFileSync('./config.json', JSON.stringify(config_json_1.default, null, 4));
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
        const { program, wallet, connection } = preLoad();
        if (argv.type === 'position') {
            // advance filter read more at: https://solanacookbook.com/guides/get-program-accounts.html#filters
            const position = await program.account.bettingState.all();
            const ownerPosition = position.filter((p) => p.account.owner.equals(wallet.publicKey));
            const poolState = {};
            await Promise.all(ownerPosition.map(async (p) => {
                if (!poolState[p.account.poolState.toString()]) {
                    poolState[p.account.poolState.toString()] = await program.account.poolState.fetch(p.account.poolState);
                }
                const protocolFeeAmount = (0, fee_1.protocolFee)(p.account.betAmount.toNumber(), poolState[p.account.poolState.toString()].protocolFeeRate);
                const tradingFeeAmount = (0, fee_1.protocolFee)(p.account.betAmount.toNumber(), poolState[p.account.poolState.toString()].tradingFeeRate);
                const isUserWin = ('up' in p.account.tradeDirection && p.account.resultPrice > p.account.positionPrice) || ('down' in p.account.tradeDirection && p.account.resultPrice < p.account.positionPrice);
                const totalPnL = p.account.resultPrice.toNumber() !== 0 ?
                    (isUserWin ? p.account.betAmount.toNumber() * 2 - tradingFeeAmount : protocolFeeAmount + p.account.betAmount.toNumber()) :
                    protocolFeeAmount;
                console.log(await (0, web3_1.getBlockTimestamp)(connection));
                console.log(p.account.destinationTimestamp.toString());
                return {
                    positionAddress: p.publicKey.toString(),
                    poolAddress: (0, utils_1.shortenAddress)(p.account.poolState.toString()),
                    threadId: (0, utils_1.shortenAddress)(p.account.thread.toString()),
                    amountIn: (p.account.betAmount.toNumber() / web3_js_1.LAMPORTS_PER_SOL).toLocaleString(),
                    positionPrice: p.account.positionPrice.toString(),
                    resultPrice: p.account.resultPrice.toString(),
                    PnL: ((isUserWin ? 1 : -1) * (totalPnL / web3_js_1.LAMPORTS_PER_SOL)).toLocaleString()
                };
            })).then(console.table);
        }
        else {
            const pool = await program.account.poolState.all();
            console.table(pool.map((p) => {
                return {
                    poolAddress: (0, utils_1.shortenAddress)(p.publicKey.toString()),
                    mint: (0, utils_1.shortenAddress)(p.account.mint.toString()),
                    tokenOracle: (0, utils_1.shortenAddress)(p.account.tokenOracle.toString()),
                    status: p.account.status === 0 ? 'open' : 'close',
                    protocolFeeRate: `${(p.account.protocolFeeRate / const_1.PERCENTAGE_PADDING)}%`,
                    tradingFeeRate: `${p.account.tradingFeeRate / const_1.PERCENTAGE_PADDING}%`
                };
            }));
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
        const depositAmount = argv.amount * web3_js_1.LAMPORTS_PER_SOL;
        const tx = new web3_js_1.Transaction();
        // wrap some SOLs
        const userNativeAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(spl_token_1.NATIVE_MINT, wallet.publicKey);
        try {
            const userNativeAccountData = await (0, spl_token_1.getAccount)(connection, userNativeAccount);
            if (userNativeAccountData.amount < depositAmount) {
                tx.add(web3_js_1.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: userNativeAccount,
                    lamports: BigInt(depositAmount) - userNativeAccountData.amount,
                }), (0, spl_token_1.createSyncNativeInstruction)(userNativeAccount, spl_token_1.TOKEN_PROGRAM_ID));
            }
        }
        catch (error) {
            await (0, spl_token_1.createWrappedNativeAccount)(connection, wallet.payer, wallet.publicKey, depositAmount);
        }
        // deposit
        const setupDeposit = await (0, instructions_1.deposit)(program, wallet.payer, const_1.OPERATOR, oracle_1.SOL_PRICE_FEED_ID, const_1.CURRENCY.publicKey, spl_token_1.NATIVE_MINT, spl_token_1.TOKEN_PROGRAM_ID, { amount: new bn_js_1.BN(depositAmount) });
        tx.add(setupDeposit.ix);
        const txHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [wallet.payer, const_1.OPERATOR]);
        (0, utils_1.explorer)({ tx: txHash });
    }
})
    .command({
    command: 'balance',
    aliases: ['balance', 'balance'],
    desc: 'get balance of account',
    builder: (yargs) => yargs,
    handler: async (argv) => {
        const { wallet, program, connection } = preLoad();
        const [userAccount] = (0, pda_1.getUserVaultAddress)(wallet.publicKey, const_1.CURRENCY.publicKey, program.programId);
        try {
            const userAccountData = await (0, spl_token_1.getAccount)(connection, userAccount);
            console.log("Balance:", (userAccountData.amount / BigInt(web3_js_1.LAMPORTS_PER_SOL)).toLocaleString());
        }
        catch (error) {
            // console.error(error);
            // console.log('=====')
            console.log("Balance: 0");
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
        }
        else {
            argv.direction = instructions_1.TradeDirection[argv.direction];
        }
        return true;
    }),
    handler: async (argv) => {
        const { program, wallet, provider, connection } = preLoad();
        const clockworkProvider = sdk_1.ClockworkProvider.fromAnchorProvider(provider);
        // get current price data -> calculate price slippage
        const accountData = await connection.getAccountInfo(oracle_1.SOL_PRICE_FEED_ID);
        const priceData = (0, client_1.parsePriceData)(accountData.data);
        const priceComponent = priceData.priceComponents[0].aggregate.priceComponent;
        console.log('current SOL/USD price', priceComponent);
        const priceSlippage = priceComponent * BigInt(const_1.PERCENT_DENOMINATION + config_json_1.default.SLIPPAGE) / BigInt(const_1.PERCENTAGE_PADDING);
        console.log('max slippage', priceSlippage);
        //
        const ltsBlockTimestamp = await (0, web3_1.getBlockTimestamp)(connection);
        console.log(ltsBlockTimestamp);
        const destinationTimestamp = ltsBlockTimestamp + argv.duration;
        console.log(destinationTimestamp);
        const setupBet = await (0, instructions_1.betting)(program, clockworkProvider, wallet.payer, spl_token_1.NATIVE_MINT, const_1.CURRENCY.publicKey, {
            threadId: Math.floor(Math.random() * 1000000000).toString(),
            amountIn: new bn_js_1.BN(argv.amount_in * web3_js_1.LAMPORTS_PER_SOL),
            priceSlippage: new bn_js_1.BN(priceSlippage.toString()),
            destinationTimestamp: new bn_js_1.BN(destinationTimestamp),
            tradeDirection: argv.direction,
        });
        const txHash = await (0, tx_1.sendAndConfirmIx)(connection, [setupBet.ix], [wallet.payer]);
        (0, utils_1.explorer)({ tx: txHash });
    }
})
    .command({
    command: 'await <position_address>',
    aliases: ['await', 'await'],
    desc: 'await the order',
    builder: (yargs) => yargs,
    handler: async (argv) => {
        const { program, provider, wallet } = preLoad();
        const clockworkProvider = sdk_1.ClockworkProvider.fromAnchorProvider(provider);
        const userBettingData = await program.account.bettingState.fetch(argv.position_address);
        await (0, cloclwork_1.waitForThreadExec)(clockworkProvider, userBettingData.thread);
        console.log("Done");
    }
})
    .command({
    command: 'complete',
    aliases: ['complete', 'complete'],
    desc: 'complete the order',
    builder: (yargs) => yargs,
    handler: async (argv) => {
        const { program, provider, wallet } = preLoad();
        const clockworkProvider = sdk_1.ClockworkProvider.fromAnchorProvider(provider);
        const setupComplete = await (0, instructions_1.complete)(program, clockworkProvider, wallet.payer, spl_token_1.NATIVE_MINT, const_1.CURRENCY.publicKey);
        const setUpCloseBetting = await (0, instructions_1.closeBetting)(program, wallet.payer, spl_token_1.NATIVE_MINT, const_1.CURRENCY.publicKey);
        const txHash = await (0, tx_1.sendAndConfirmIx)(program.provider.connection, [setupComplete.ix, setUpCloseBetting.ix], [wallet.payer]);
        (0, utils_1.explorer)({ tx: txHash });
    }
})
    .help()
    .argv;
