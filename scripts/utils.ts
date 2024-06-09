import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import fs from 'fs'
import path from 'path'
import { IDL } from 'target/types/fluster_trading';

export const FLUSTER_PROGRAM_ID = new PublicKey("4AHGtdLDrWNPfVaDZD5N8JD2CPFRAZnKdPHtaEohfg9W");
export const mintKeyPair = new Wallet(
    Keypair.fromSeed(Uint8Array.from(
        JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname, '../tests/assets/currency.json'),
                { encoding: 'utf-8' }
            )
        ).slice(0, 32))
    )
);

export const loadKey = () => {
    const key = JSON.parse(fs.readFileSync("/Users/tung/.config/solana/id.json", { encoding: 'utf-8' }));
    const wallet = new Wallet(
        Keypair.fromSeed(Uint8Array.from(key.slice(0, 32)))
    );
    const connection = new Connection("https://api.devnet.solana.com");
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

    const program = new Program(IDL, FLUSTER_PROGRAM_ID, provider);
    return {
        connection,
        program,
        provider,
        wallet
    }
}

export const SOL_PRICE_FEED_ID = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");