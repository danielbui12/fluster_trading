"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAndConfirmIx = void 0;
const web3_js_1 = require("@solana/web3.js");
class SendIxError extends Error {
    constructor(originalError) {
        //The newlines don't actually show up correctly in chai's assertion error, but at least
        // we have all the information and can just replace '\n' with a newline manually to see
        // what's happening without having to change the code.
        const logs = originalError.logs?.join('\n') || "error had no logs";
        super(originalError.message + "\nlogs:\n" + logs);
        this.stack = originalError.stack;
        this.logs = logs;
    }
}
const sendAndConfirmIx = async (connection, ix, signer, computeUnits, confirmOptions) => {
    let [signers, units] = (() => {
        return [
            Array.isArray(signer)
                ? signer
                : [signer],
            computeUnits
        ];
    })();
    let ixs = [];
    if (Array.isArray(ix)) {
        ixs.push(...ix);
    }
    else {
        ixs.push(...(await ix));
    }
    const tx = new web3_js_1.Transaction().add(...ixs);
    if (units)
        tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units }));
    try {
        return await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, signers, confirmOptions);
    }
    catch (error) {
        throw new SendIxError(error);
    }
};
exports.sendAndConfirmIx = sendAndConfirmIx;
