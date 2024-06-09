"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForThreadExec = void 0;
const bn_js_1 = require("bn.js");
let lastThreadExec = new bn_js_1.BN(0);
const waitForThreadExec = async (clockworkProvider, thread, maxWait = 60) => {
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
        console.log("Next await");
        await new Promise((r) => setTimeout(r, i * 1000));
    }
};
exports.waitForThreadExec = waitForThreadExec;
