import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { FlusterTrading } from "../idl/fluster_trading";

let lastThreadExec = new BN(0);
export const waitForClockworkThreadExec = async (clockworkProvider: ClockworkProvider, thread: PublicKey, maxWait: number = 60) => {
    let i = 1;
    while (true) {
        const execContext = (await clockworkProvider.getThreadAccount(thread)).execContext;
        if (execContext) {
            if (lastThreadExec.toString() == "0" || execContext.lastExecAt > lastThreadExec) {
                lastThreadExec = execContext.lastExecAt;
                break;
            }
        }
        if (i == maxWait) throw Error("Timeout");
        i += 1;
        await new Promise((r) => setTimeout(r, i * 1000));
    }
}

export const waitForFlusterThreadExec = async (program: Program<FlusterTrading>, bettingAddress: PublicKey, maxWait: number = 60) => {
    let i = 1;
    while (true) {
        const position = await program.account.bettingState.fetch(bettingAddress);
        if (position) {
            if (position.resultPrice.toNumber() > 0) {
                break;
            }
        }
        if (i == maxWait) throw Error("Timeout");
        i += 1;
        await new Promise((r) => setTimeout(r, i * 1000));
    }
}
