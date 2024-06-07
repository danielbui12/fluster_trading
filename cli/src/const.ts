import { Keypair, PublicKey } from "@solana/web3.js";
export const MIN_PERCENTAGE = 1;
export const MAX_PERCENTAGE = 5;
export const PERCENTAGE_PADDING = 100;

export const PERCENT_DENOMINATION = 10_000;

export const FLUSTER_PROGRAM_ID = new PublicKey("4AHGtdLDrWNPfVaDZD5N8JD2CPFRAZnKdPHtaEohfg9W");
export const CURRENCY = Keypair.fromSeed(Uint8Array.from([175, 56, 198, 205, 103, 192, 134, 9, 250, 113, 54, 243, 70, 231, 227, 148, 133, 239, 243, 139, 140, 57, 23, 126, 120, 46, 199, 4, 35, 149, 98, 65, 8, 167, 220, 218, 29, 155, 187, 18, 184, 26, 94, 142, 135, 16, 67, 9, 74, 230, 16, 120, 196, 156, 34, 41, 125, 179, 116, 211, 98, 138, 114, 112].slice(0, 32)));
export const OPERATOR = Keypair.fromSeed(Uint8Array.from([137, 249, 207, 240, 179, 235, 177, 148, 145, 229, 131, 14, 29, 157, 92, 24, 220, 145, 208, 118, 250, 93, 134, 148, 209, 174, 87, 106, 43, 52, 96, 153, 9, 103, 212, 49, 76, 232, 150, 65, 237, 209, 90, 169, 33, 54, 228, 71, 177, 11, 143, 176, 23, 105, 85, 26, 233, 246, 45, 220, 208, 170, 221, 238].slice(0, 32)));
