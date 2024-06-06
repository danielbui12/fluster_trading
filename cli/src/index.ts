#!/usr/bin/env node

import { MAX_PERCENTAGE, MIN_PERCENTAGE, PERCENTAGE_PADDING } from "./const";

const config = require('../config.json');
const fs = require('fs');

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
        desc: 'view current orders',
        builder: (yargs) => yargs,
        handler: (argv) => {

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
        handler: (argv) => {

        }
    })
    .command({
        command: 'balance',
        aliases: ['balance', 'balance'],
        desc: 'get balance of account',
        builder: (yargs) => yargs,
        handler: (argv) => {

        }
    })
    .command({
        command: 'bet <amount_in>',
        aliases: ['bet', 'bet'],
        desc: 'bet',
        builder: (yargs) => yargs
            .number('amount_in')
            .check(argv => {
                if (isNaN(argv.amount_in)) {
                    throw new Error('<amount_in> must be a number');
                }
                return true;
            }),
        handler: (argv) => {

        }
    })
    .command({
        command: 'complete',
        aliases: ['complete', 'complete'],
        desc: 'complete the order',
        builder: (yargs) => yargs,
        handler: (argv) => {

        }
    })
    .help()
    .argv;
