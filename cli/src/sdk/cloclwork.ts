import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

let lastThreadExec = new BN(0);
export const waitForThreadExec = async (clockworkProvider: ClockworkProvider, thread: PublicKey, maxWait: number = 60) => {
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
        console.log("Next await");
        await new Promise((r) => setTimeout(r, i * 1000));
    }
}
