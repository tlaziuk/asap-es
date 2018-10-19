import { expect } from "chai";
import delay from "./delay";

describe(delay.name || "delay", () => {
    it(`should return a '${Promise.name}'`, () => {
        expect(delay(0)).to.be.instanceOf(Promise);
    });
    it("should be working with negative timeout", async () => {
        await delay(-100);
    });
    it("should resolve value", async () => {
        expect(await delay(0, "abc")).to.be.equal("abc");
    });
    it(`should resolve value from '${Promise.name}'`, async () => {
        expect(await delay(0, Promise.resolve("abc"))).to.be.equal("abc");
    });
    it(`should reject value from '${Promise.name}'`, (done) => {
        const reject = Promise.reject(new Error());
        reject.catch(() => void 0);
        delay(0, reject).catch(() => { done(); });
    });
});
