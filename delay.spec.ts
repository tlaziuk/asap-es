import {
    expect,
} from "chai";

import {
    spy,
} from "sinon";

import delay from "./delay";

describe(delay.name || "delay", () => {
    it("should return a 'Promise'", () => {
        expect(delay(0)).to.be.instanceOf(Promise);
    });
    it("should be working with negative timeout", async () => {
        await delay(-100);
    });
    it("should resolve value", async () => {
        expect(await delay(0, "abc")).to.be.equal("abc");
    });
    it("should resolve value from 'Promise'", async () => {
        expect(await delay(0, Promise.resolve("abc"))).to.be.equal("abc");
    });
    it("should reject value from 'Promise'", (done) => {
        const reject = Promise.reject(new Error());
        reject.catch(() => void 0);
        delay(0, reject).catch(() => { done(); });
    });
});
