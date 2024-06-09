"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATOR = exports.CURRENCY = exports.FLUSTER_PROGRAM_ID = exports.PERCENT_DENOMINATION = exports.PERCENTAGE_PADDING = exports.MAX_PERCENTAGE = exports.MIN_PERCENTAGE = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
exports.MIN_PERCENTAGE = 1;
exports.MAX_PERCENTAGE = 5;
exports.PERCENTAGE_PADDING = 100;
exports.PERCENT_DENOMINATION = 10000;
exports.FLUSTER_PROGRAM_ID = new web3_js_1.PublicKey("4AHGtdLDrWNPfVaDZD5N8JD2CPFRAZnKdPHtaEohfg9W");
exports.CURRENCY = web3_js_1.Keypair.fromSeed(Uint8Array.from([175, 56, 198, 205, 103, 192, 134, 9, 250, 113, 54, 243, 70, 231, 227, 148, 133, 239, 243, 139, 140, 57, 23, 126, 120, 46, 199, 4, 35, 149, 98, 65, 8, 167, 220, 218, 29, 155, 187, 18, 184, 26, 94, 142, 135, 16, 67, 9, 74, 230, 16, 120, 196, 156, 34, 41, 125, 179, 116, 211, 98, 138, 114, 112].slice(0, 32)));
const operatorKey = JSON.parse(fs_1.default.readFileSync("/Users/tung/.config/solana/id.json", { encoding: 'utf-8' }));
exports.OPERATOR = web3_js_1.Keypair.fromSeed(Uint8Array.from(operatorKey.slice(0, 32)));
