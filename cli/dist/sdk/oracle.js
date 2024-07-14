"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAINLINK_PROGRAM_ID = exports.SOL_PRICE_FEED_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
/// Pyth
// export const SOL_PRICE_FEED_ID = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");
// new PublicKey("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG");
/// Chainlink
exports.SOL_PRICE_FEED_ID = new web3_js_1.PublicKey("99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR");
exports.CHAINLINK_PROGRAM_ID = new web3_js_1.PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny");
