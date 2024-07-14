import { PublicKey } from "@solana/web3.js";

/// Pyth
// export const SOL_PRICE_FEED_ID = new PublicKey("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG");

/// Chainlink
export const SOL_PRICE_FEED_ID = new PublicKey("CH31Xns5z3M1cTAbKW34jcxPPciazARpijcHj9rxtemt");
export const CHAINLINK_PROGRAM_ID = new PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny");


export class ChainLinkAggregatorAccount {
  answer = 0;
  round_id = 0;
  slot = 0;
  timestamp = 0;
  constructor(fields: { answer: number, round_id: number, slot: number, timestamp: number } | undefined = undefined) {
    if (fields) {
      this.answer = fields.answer
      this.round_id = fields.round_id
      this.slot = fields.slot
      this.timestamp = fields.timestamp
    }
  }
}

// Borsh schema definition for greeting accounts
export const ChainLinkAggregatorSchema = new Map([
  [ChainLinkAggregatorAccount, {
    kind: 'struct',
    fields: [
      ['answer', 'u128'],
      ['round_id', 'u32'],
      ['slot', 'u64'],
      ['timestamp', 'u32'],
    ]
  }],
])
