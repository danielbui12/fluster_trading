import OperatorKeyPair from "./operator.json";
import UserKeyPair from "./user.json";
import MintKeyPair from "./currency.json";
import { Keypair } from "@solana/web3.js";

export const operator = Keypair.fromSeed(Uint8Array.from(OperatorKeyPair.slice(0, 32)));
export const user = Keypair.fromSeed(Uint8Array.from(UserKeyPair.slice(0, 32)));
export const currency = Keypair.fromSeed(Uint8Array.from(MintKeyPair.slice(0, 32)));
