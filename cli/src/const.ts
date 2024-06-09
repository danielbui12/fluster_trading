import { Keypair, PublicKey } from "@solana/web3.js";
import fs from 'fs';

export const MIN_PERCENTAGE = 1;
export const MAX_PERCENTAGE = 5;
export const PERCENTAGE_PADDING = 100;

export const PERCENT_DENOMINATION = 10_000;

export const FLUSTER_PROGRAM_ID = new PublicKey("4AHGtdLDrWNPfVaDZD5N8JD2CPFRAZnKdPHtaEohfg9W");
export const CURRENCY = Keypair.fromSeed(Uint8Array.from([175, 56, 198, 205, 103, 192, 134, 9, 250, 113, 54, 243, 70, 231, 227, 148, 133, 239, 243, 139, 140, 57, 23, 126, 120, 46, 199, 4, 35, 149, 98, 65, 8, 167, 220, 218, 29, 155, 187, 18, 184, 26, 94, 142, 135, 16, 67, 9, 74, 230, 16, 120, 196, 156, 34, 41, 125, 179, 116, 211, 98, 138, 114, 112].slice(0, 32)));
const operatorKey = JSON.parse(fs.readFileSync("/Users/tung/.config/solana/id.json", { encoding: 'utf-8' }));
export const OPERATOR = Keypair.fromSeed(Uint8Array.from(operatorKey.slice(0, 32)));
