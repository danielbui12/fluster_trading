import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";
import { parsePriceData } from "@pythnetwork/client";
import { sleep } from "./sdk/utils";

describe("initialize test", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const owner = anchor.Wallet.local().payer;
    console.log("owner: ", owner.publicKey.toString());
    const connection = anchor.getProvider().connection;

    it("get lts price", async () => {
        const SOL_PRICE_FEED_ID = new PublicKey("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG");
        const accountData = await connection.getAccountInfo(SOL_PRICE_FEED_ID);
        const priceData = parsePriceData(accountData.data);
        // console.log('priceComponents', priceData.priceComponents);
        console.log('SOL/USD', priceData.priceComponents[0].aggregate.price);
        console.log('SOL/USD', priceData.priceComponents[0].aggregate.priceComponent);
        assert(true);
    });

    it("get lts price again", async () => {
        await sleep(5000);
        const SOL_PRICE_FEED_ID = new PublicKey("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG");
        const accountData = await connection.getAccountInfo(SOL_PRICE_FEED_ID);
        const priceData = parsePriceData(accountData.data);
        // console.log('priceComponents', priceData.priceComponents);
        console.log('SOL/USD', priceData.priceComponents[0].aggregate.price);
        console.log('SOL/USD', priceData.priceComponents[0].aggregate.priceComponent);
        assert(true);
    });
});
