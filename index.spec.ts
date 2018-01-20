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
        expect(() => { asap.c = 1; }).to.not.throw();
        expect(() => { asap.c = 0; }).to.throw();
        expect(() => { asap.c = -1; }).to.throw();
        expect(asap.c).to.be.equal(1);
    });
    it("should the queue run", async () => {
        const asap = new ASAP();
        const prom = asap.q(() => void 0);
        expect(prom).to.be.instanceof(Promise);
        await prom;
    });
    it("should handle rejection", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.q(() => { throw new Error(); }),
            asap.q(() => Promise.reject(new Error())),
        ].map((prom) => {
            prom.catch((e) => {
                expect(e).to.be.instanceof(Error);
            });
        }));
    });
    it("should the queue run two times", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.q(() => void 0),
            asap.q(() => void 0),
        ]);
    }).timeout(10);
    it("should the queue run two slow tasks", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.q(() => timeout(() => void 0, 50)),
            asap.q(() => timeout(() => void 0, 50)),
        ]);
    }).timeout(110);
    it("should the queue run two slow tasks - concurrency", async () => {
        const asap = new ASAP();
        asap.c = 2;
        await Promise.all([
            asap.q(() => timeout(() => void 0, 50)),
            asap.q(() => timeout(() => void 0, 50)),
        ]);
    }).timeout(60);
    it("should the queue run slow tasks with unmatching concurrency to the tasks number", async () => {
        const asap = new ASAP();
        asap.c = 2;
        await Promise.all([
            asap.q(() => timeout(() => void 0, 50)),
            asap.q(() => timeout(() => void 0, 50)),
            asap.q(() => timeout(() => void 0, 50)),
            asap.q(() => timeout(() => void 0, 50)),
            asap.q(() => timeout(() => void 0, 50)),
        ]);
    }).timeout(160);
    it("should the queue run when on stress", async () => {
        const asap = new ASAP();
        asap.c = 10;
        await Promise.all(Array(1e4).map(async (v, index) => {
            const promSpy = spy();
            await asap.q(() => index).then(promSpy, promSpy);
            expect(promSpy.callCount).to.be.equal(1);
        }));
    }).timeout(1e4);
});
