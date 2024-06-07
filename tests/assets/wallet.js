"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currency = exports.user = exports.operator = void 0;
const operator_json_1 = __importDefault(require("./operator.json"));
const user_json_1 = __importDefault(require("./user.json"));
const currency_json_1 = __importDefault(require("./currency.json"));
const web3_js_1 = require("@solana/web3.js");
exports.operator = web3_js_1.Keypair.fromSeed(Uint8Array.from(operator_json_1.default.slice(0, 32)));
exports.user = web3_js_1.Keypair.fromSeed(Uint8Array.from(user_json_1.default.slice(0, 32)));
exports.currency = web3_js_1.Keypair.fromSeed(Uint8Array.from(currency_json_1.default.slice(0, 32)));
