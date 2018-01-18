import {
    expect,
} from "chai";

import {
    SinonSpy,
    spy,
    stub,
} from "sinon";

import ASAP from "./index";

const timeout = <T>(fn: () => T | PromiseLike<T>, time: number = 0) => new Promise<T>((resolve) => {
    setTimeout(() => {
        resolve(fn());
    }, time);
});

describe(ASAP.name, () => {
    it("should be a class", () => {
        expect(ASAP).to.be.a("function");
    });
    it("should be possible to create an instance", () => {
        expect(new ASAP()).to.be.a("object");
    });
    it("should concurrency be working", () => {
        const asap = new ASAP();
        expect(() => { asap.concurrency = 1; }).to.not.throw();
        expect(() => { asap.concurrency = 0; }).to.throw();
        expect(() => { asap.concurrency = -1; }).to.throw();
        expect(asap.concurrency).to.be.equal(1);
    });
    it("should the queue run", async () => {
        const asap = new ASAP();
        const prom = asap.enqueue(() => void 0);
        expect(prom).to.be.instanceof(Promise);
        await prom;
    });
    it("should handle rejection", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.enqueue(() => { throw new Error(); }),
            asap.enqueue(() => Promise.reject(new Error())),
        ].map((prom) => {
            prom.catch((e) => {
                expect(e).to.be.instanceof(Error);
            });
        }));
    });
    it("should the queue run two times", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.enqueue(() => void 0),
            asap.enqueue(() => void 0),
        ]);
    }).timeout(10);
    it("should the queue run two slow tasks", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.enqueue(() => timeout(() => void 0, 50)),
            asap.enqueue(() => timeout(() => void 0, 50)),
        ]);
    }).timeout(110);
    it("should the queue run two slow tasks - concurrency", async () => {
        const asap = new ASAP();
        asap.concurrency = 2;
        await Promise.all([
            asap.enqueue(() => timeout(() => void 0, 50)),
            asap.enqueue(() => timeout(() => void 0, 50)),
        ]);
    }).timeout(60);
    it("should the queue run slow tasks with unmatching concurrency to the tasks number", async () => {
        const asap = new ASAP();
        asap.concurrency = 2;
        await Promise.all([
            asap.enqueue(() => timeout(() => void 0, 50)),
            asap.enqueue(() => timeout(() => void 0, 50)),
            asap.enqueue(() => timeout(() => void 0, 50)),
            asap.enqueue(() => timeout(() => void 0, 50)),
            asap.enqueue(() => timeout(() => void 0, 50)),
        ]);
    }).timeout(160);
    it("should the queue run when on stress", async () => {
        const asap = new ASAP();
        asap.concurrency = 10;
        await Promise.all(Array(1e4).map(async (v, index) => {
            const promSpy = spy();
            await asap.enqueue(() => index).then(promSpy, promSpy);
            expect(promSpy.callCount).to.be.equal(1);
        }));
    }).timeout(1e4);
});
