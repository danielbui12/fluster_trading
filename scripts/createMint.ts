import { createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { loadKey, mintKeyPair } from "./utils";
import { sendAndConfirmIx } from "tests/sdk/tx";
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

async function main() {
    const { connection, wallet } = loadKey();
    console.log('payer', wallet.publicKey.toString());
    console.log(mintKeyPair.publicKey.toString());

    const DECIMALs = 9;
    const mint = await createMint(
        connection,
        wallet.payer,
        wallet.publicKey,
        null, // freezeAuthority
        DECIMALs,
        mintKeyPair.payer,
    );
    console.log("Created mint:", mint.toString())

    const ix = createCreateMetadataAccountV3Instruction({
        metadata: PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            METADATA_PROGRAM_ID
        )[0],
        mint: mint,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
    },
        {
            createMetadataAccountArgsV3: {
                data: {
                    name: "Fluster Trading USD",
                    symbol: "ftUSD",
                    uri: "https://indigo-precious-jellyfish-535.mypinata.cloud/ipfs/QmXYy8C1obnimCPCfEPrykqv9rhGh68KaAbDdu4dup4by6",
                    creators: null,
                    sellerFeeBasisPoints: 0,
                    uses: null,
                    collection: null,
                },
                isMutable: false,
                collectionDetails: null,
            },
        })

    await sendAndConfirmIx(connection, [ix], [wallet.payer]);
    console.log('created metadata');

    let ata = await getOrCreateAssociatedTokenAccount(connection, wallet.payer, mint, wallet.publicKey);
    console.log('created ata', ata.address.toString());

    await mintTo(connection, wallet.payer, mint, ata.address, wallet.publicKey, 1_000_000_000 * 10 ** DECIMALs, [wallet.payer]);
    ata = await getAccount(connection, ata.address);
    console.log('minted', ata.amount.toString());
}

main();