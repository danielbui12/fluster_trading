import { initialize } from "tests/sdk/instructions";
import { SOL_PRICE_FEED_ID, loadKey, mintKeyPair } from "./utils";
import { NATIVE_MINT } from "@solana/spl-token";
import { sendAndConfirmIx } from "tests/sdk/tx";

async function main() {
    const { program, connection, wallet } = loadKey();
    const setupInitialize = await initialize(program, wallet.payer, SOL_PRICE_FEED_ID, NATIVE_MINT, mintKeyPair.publicKey, {
        trading_fee_rate: 2000, // 20%
        protocol_fee_rate: 1, // 0.01%
    })
    await sendAndConfirmIx(connection, [setupInitialize.ix], [wallet.payer]);
    console.log('setup done');
}

main()