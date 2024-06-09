"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForFlusterThreadExec = exports.waitForClockworkThreadExec = void 0;
const bn_js_1 = require("bn.js");
let lastThreadExec = new bn_js_1.BN(0);
const waitForClockworkThreadExec = async (clockworkProvider, thread, maxWait = 60) => {
    let i = 1;
    while (true) {
        const execContext = (await clockworkProvider.getThreadAccount(thread)).execContext;
        if (execContext) {
            if (lastThreadExec.toString() == "0" || execContext.lastExecAt > lastThreadExec) {
                lastThreadExec = execContext.lastExecAt;
                break;
            }
        }
        if (i == maxWait)
            throw Error("Timeout");
        i += 1;
        await new Promise((r) => setTimeout(r, i * 1000));
    }
};
exports.waitForClockworkThreadExec = waitForClockworkThreadExec;
const waitForFlusterThreadExec = async (program, bettingAddress, maxWait = 60) => {
    let i = 1;
    while (true) {
        const position = await program.account.bettingState.fetch(bettingAddress);
        if (position) {
            if (position.resultPrice.toNumber() > 0) {
                break;
            }
        }
        if (i == maxWait)
            throw Error("Timeout");
        i += 1;
        await new Promise((r) => setTimeout(r, i * 1000));
    }
};
exports.waitForFlusterThreadExec = waitForFlusterThreadExec;
