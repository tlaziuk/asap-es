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
    it("should be working with functions", async () => {
        const spyFn = spy(() => "abc");
        await delay(0, spyFn);
        expect(spyFn.callCount).to.be.equal(1);
    });
    it("should run the functions in proper order", async () => {
        const spyFn1 = spy();
        const spyFn2 = spy();
        const delay1 = delay(20, spyFn1);
        const delay2 = delay(0, spyFn2);
        await Promise.all([
            delay1,
            delay2,
        ]);
        expect(spyFn1.calledAfter(spyFn2)).to.be.equal(true);
    });
    it("should reject the promise when promise returned from function rejects", (done) => {
        delay(0, () => Promise.reject(new Error())).catch(() => { done(); });
    });
    it("should reject the promise when function throws", (done) => {
        delay(0, () => { throw new Error(); }).catch(() => { done(); });
    });
});
