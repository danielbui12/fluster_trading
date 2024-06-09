import * as anchor from '@coral-xyz/anchor';
import { CronJob } from 'cron';
import { FlusterTrading } from "target/types/fluster_trading";
import { currency } from 'tests/assets/wallet';
import { reveal } from 'tests/sdk/instructions';
import { sendAndConfirmIx } from 'tests/sdk/tx';
import { getBlockTimestamp } from 'tests/sdk/web3';

anchor.setProvider(anchor.AnchorProvider.env());
const admin = anchor.Wallet.local().payer;
const connection = anchor.getProvider().connection;
const program = anchor.workspace.FlusterTrading as anchor.Program<FlusterTrading>;

async function executor() {
    try {
        console.log("trigger");
        const positions = await program.account.bettingState.all();
        if (positions.length === 0) return;
        console.log('position destination timestamp', positions[0].account.destinationTimestamp.toString());
        const ltsBlockData = await getBlockTimestamp(connection);
        const needToExecutePosition = positions.filter((p) => {
            return new anchor.BN(ltsBlockData).gte(p.account.destinationTimestamp) && p.account.resultPrice.toNumber() === 0;
        });
        if (needToExecutePosition.length === 0) return;
        const ix = await Promise.all(
            needToExecutePosition.map(async (p) => {
                return (await reveal(program, admin, p.publicKey, currency.publicKey)).ix;
            })
        )
        console.log("Execute", ix.length, "instructions");
        await sendAndConfirmIx(connection, ix, [admin]);
    } catch (error) {
        console.log(error);
    }
}

new CronJob(
    '*/10 * * * * *',
    executor,
    null,
    true,
    'Asia/Ho_Chi_Minh'
);
