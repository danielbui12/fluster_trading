import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export const POOL_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("pool")
);
export const POOL_VAULT_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("pool_vault")
);
export const POOL_AUTH_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("vault_auth_seed")
);
export const USER_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("user_auth_seed")
);
export const BETTING_STATE_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("betting_state")
);

export function u16ToBytes(num: number) {
    const arr = new ArrayBuffer(2);
    const view = new DataView(arr);
    view.setUint16(0, num, false);
    return new Uint8Array(arr);
}

export function i16ToBytes(num: number) {
    const arr = new ArrayBuffer(2);
    const view = new DataView(arr);
    view.setInt16(0, num, false);
    return new Uint8Array(arr);
}

export function u32ToBytes(num: number) {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, num, false);
    return new Uint8Array(arr);
}

export function i32ToBytes(num: number) {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setInt32(0, num, false);
    return new Uint8Array(arr);
}

export function getAuthAddress(
    programId: PublicKey
): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [POOL_AUTH_SEED],
        programId
    );
    return [address, bump];
}

export function getPoolAddress(
    token_mint: PublicKey,
    programId: PublicKey
): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [
            POOL_SEED,
            token_mint.toBuffer(),
        ],
        programId
    );
    return [address, bump];
}

export function getPoolVaultAddress(
    pool: PublicKey,
    token_mint: PublicKey,
    programId: PublicKey
): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [
            POOL_VAULT_SEED,
            pool.toBuffer(),
            token_mint.toBuffer(),
        ],
        programId
    );
    return [address, bump];
}

export function getUserVaultAddress(
    payer: PublicKey,
    token_mint: PublicKey,
    programId: PublicKey
): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [
            USER_SEED,
            payer.toBuffer(),
            token_mint.toBuffer(),
        ],
        programId
    );
    return [address, bump];
}

export function getUserBettingState(
    payer: PublicKey,
    poolState: PublicKey,
    programId: PublicKey
): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [
            BETTING_STATE_SEED,
            poolState.toBuffer(),
            payer.toBuffer(),
        ],
        programId
    );
    return [address, bump];
}
