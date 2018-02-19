import {
    expect,
} from "chai";

import {
    SinonSpy,
    spy,
    stub,
} from "sinon";

import ASAP, { task } from "./index";

import delay from "./delay";

describe(ASAP.name, () => {
    it("should be a class", () => {
        expect(ASAP).to.be.a("function");
    });
    it("should be possible to create an instance", () => {
        const queue = new ASAP();
        expect(queue).to.be.instanceof(ASAP);
    });
    it("should be possible to create an instance by call", () => {
        const queue = ASAP();
        expect(queue).to.be.instanceof(ASAP);
    });
    it("should the default concurrency be set", () => {
        const asap = new ASAP();
        expect(asap.c).to.be.equal(1);
    });
    it("should assigning and getting concurrency be working", () => {
        const asap = new ASAP();
        expect(() => { asap.c = 1; }).to.not.throw();
        expect(() => { asap.c = 0; }).to.not.throw();
        expect(() => { asap.c = -1; }).to.not.throw();
        expect(asap.c).to.be.equal(0);
    });
    it("should the queue run", async () => {
        const spyFn = spy();
        const asap = new ASAP();
        const prom = asap.q(spyFn);
        expect(prom).to.be.instanceof(Promise);
        await prom;
        expect(spyFn.callCount).to.be.equal(1);
    });
    it("should the queue run with a promise of task", async () => {
        const spyFn = spy();
        const asap = new ASAP();
        const prom = asap.q(Promise.resolve(spyFn));
        expect(prom).to.be.instanceof(Promise);
        await prom;
        expect(spyFn.callCount).to.be.equal(1);
    });
    it("should reject when promise of a task rejects", (done) => {
        const asap = new ASAP();
        const prom = asap.q(Promise.reject(new Error()));
        expect(prom).to.be.instanceof(Promise);
        prom.catch(() => { done(); });
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
    it("should the queue run multiple times", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.q(() => void 0),
            asap.q(() => void 0),
            asap.q(() => void 0),
            asap.q(() => void 0),
        ]);
    });
    it("should run same task", async () => {
        const asap = new ASAP();
        const spyFn = spy(() => delay(10));
        const proms = [
            asap.q(spyFn),
            asap.q(spyFn),
            asap.q(spyFn),
            asap.q(spyFn),
        ];
        await Promise.all(proms);
        expect(spyFn.callCount).to.be.equal(proms.length, "task not called as many times as expected");
    }).timeout(50);
    it("should run same task with concurrency", async () => {
        const asap = new ASAP();
        asap.c = Infinity;
        const spyFn = spy(() => delay(10));
        await Promise.all([
            asap.q(spyFn),
            asap.q(spyFn),
            asap.q(spyFn),
            asap.q(spyFn),
        ]);
        expect(spyFn.callCount).to.be.equal(4);
    }).timeout(20);
    it("should the queue run in proper order", async () => {
        const asap = new ASAP();
        const spyFn1 = spy();
        const spyFn2 = spy();
        const spyFn3 = spy();
        await Promise.all([
            asap.q(spyFn1),
            asap.q(spyFn2),
            asap.q(spyFn3),
        ]);
        expect(spyFn1.calledBefore(spyFn2)).to.be.equal(true);
        expect(spyFn2.calledBefore(spyFn3)).to.be.equal(true);
    });
    it("should the queue run slow tasks", async () => {
        const asap = new ASAP();
        await Promise.all([
            asap.q(() => delay(50)),
            asap.q(() => delay(50)),
        ]);
    }).timeout(110);
    it("should the queue run slow tasks - concurrency", async () => {
        const asap = new ASAP();
        asap.c = 2;
        await Promise.all([
            asap.q(() => delay(50)),
            asap.q(() => delay(50)),
        ]);
    }).timeout(60);
    it("should the queue run in proper order - concurrency", async () => {
        const asap = new ASAP();
        const spyFn1 = spy();
        const spyFn2 = spy();
        const spyFn3 = spy();
        const spyFn4 = spy();
        const spyFn5 = spy();
        asap.c = 2;
        await Promise.all([
            asap.q(delay(10, spyFn1)),
            asap.q(delay(10, spyFn2)),
            asap.q(delay(10, spyFn3)),
            asap.q(delay(10, spyFn4)),
            asap.q(delay(10, spyFn5)),
        ]);
        expect(spyFn1.callCount).to.be.equal(1, "task 1 not called");
        expect(spyFn2.callCount).to.be.equal(1, "task 2 not called");
        expect(spyFn3.callCount).to.be.equal(1, "task 3 not called");
        expect(spyFn4.callCount).to.be.equal(1, "task 4 not called");
        expect(spyFn5.callCount).to.be.equal(1, "task 5 not called");
        expect(spyFn1.calledBefore(spyFn3)).to.be.equal(true, "task 1 should run before task 3");
        expect(spyFn2.calledBefore(spyFn3)).to.be.equal(true, "task 2 should run before task 3");
        expect(spyFn1.calledBefore(spyFn4)).to.be.equal(true, "task 1 should run before task 4");
        expect(spyFn2.calledBefore(spyFn4)).to.be.equal(true, "task 2 should run before task 4");
        expect(spyFn3.calledBefore(spyFn5)).to.be.equal(true, "task 3 should run before task 5");
        expect(spyFn4.calledBefore(spyFn5)).to.be.equal(true, "task 4 should run before task 5");
    });
    it("should the queue run slow tasks", async () => {
        const asap = new ASAP();
        asap.c = 2;
        await Promise.all([
            asap.q(() => delay(50)),
            asap.q(() => delay(50)),
            asap.q(() => delay(50)),
            asap.q(() => delay(50)),
            asap.q(() => delay(50)),
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
    it("should the task priorities be working", async () => {
        const asap = new ASAP();
        const spyFn1 = spy(() => delay(5));
        const spyFn2 = spy(() => delay(5));
        const spyFn3 = spy(() => delay(5));
        const spyFn4 = spy(() => delay(5));
        const spyFn5 = spy(() => delay(5));
        const spyFn6 = spy(() => delay(5));
        const spyFn7 = spy(() => delay(5));
        await Promise.all([
            asap.q(spyFn1),
            asap.q(spyFn2, 3),
            asap.q(spyFn3, 22),
            asap.q(spyFn4, 1),
            asap.q(spyFn5, -1),
            asap.q(spyFn6, -65),
            asap.q(spyFn7, 0),
        ]);
        expect(spyFn1.calledBefore(spyFn5)).to.be.equal(true);
        expect(spyFn1.calledBefore(spyFn6)).to.be.equal(true);
        expect(spyFn1.calledBefore(spyFn7)).to.be.equal(true);
        expect(spyFn2.calledBefore(spyFn3)).to.be.equal(true);
        expect(spyFn3.calledAfter(spyFn6)).to.be.equal(true);
        expect(spyFn4.calledBefore(spyFn2)).to.be.equal(true);
        expect(spyFn5.calledBefore(spyFn3)).to.be.equal(true);
        expect(spyFn6.calledBefore(spyFn5)).to.be.equal(true);
        expect(spyFn7.calledBefore(spyFn2)).to.be.equal(true);
    }).timeout(1e4);
    it("should the task priorities be working with concurrency", async () => {
        const asap = new ASAP();
        asap.c = 2;
        const spyFn1 = spy(() => delay(5));
        const spyFn2 = spy(() => delay(5));
        const spyFn3 = spy(() => delay(5));
        const spyFn4 = spy(() => delay(5));
        const spyFn5 = spy(() => delay(5));
        const spyFn6 = spy(() => delay(5));
        const spyFn7 = spy(() => delay(5));
        await Promise.all([
            asap.q(spyFn1, 3),
            asap.q(spyFn2, 2),
            asap.q(spyFn3, 1),
            asap.q(spyFn4, 0),
            asap.q(spyFn5, -1),
            asap.q(spyFn6, -2),
            asap.q(spyFn7, -3),
        ]);
        expect(spyFn1.calledBefore(spyFn3)).to.be.equal(true);
        expect(spyFn1.calledBefore(spyFn4)).to.be.equal(true);
        expect(spyFn2.calledBefore(spyFn3)).to.be.equal(true);
        expect(spyFn2.calledBefore(spyFn4)).to.be.equal(true);
        expect(spyFn7.calledBefore(spyFn3)).to.be.equal(true);
        expect(spyFn7.calledBefore(spyFn4)).to.be.equal(true);
        expect(spyFn6.calledBefore(spyFn3)).to.be.equal(true);
        expect(spyFn6.calledBefore(spyFn4)).to.be.equal(true);
        expect(spyFn5.calledBefore(spyFn3)).to.be.equal(true);
        expect(spyFn5.calledBefore(spyFn4)).to.be.equal(true);
        expect(spyFn7.calledAfter(spyFn1)).to.be.equal(true);
        expect(spyFn7.calledAfter(spyFn2)).to.be.equal(true);
    }).timeout(1e4);
    it("should default concurrency be set", () => {
        const asap = new ASAP();
        expect(asap.c).to.be.equal(1);
    });
    it("should it be possible to create the queue as paused", () => {
        const asap1 = new ASAP(false);
        expect(asap1.c).to.be.equal(0);
        const asap2 = new ASAP(0);
        expect(asap2.c).to.be.equal(0);
        const asap3 = new ASAP(-999);
        expect(asap3.c).to.be.equal(0);
    });
    it("should it be possible to create the queue with custom concurrency", () => {
        const asap = new ASAP(999);
        expect(asap.c).to.be.equal(999);
    });
    it("should it be possible to create the queue as paused and run it later", async () => {
        const asap = new ASAP(false);
        expect(asap.c).to.be.equal(0);
        const spyFn1 = spy(() => delay(10));
        const spyFn2 = spy(() => delay(10));
        const proms = [
            asap.q(spyFn1),
            asap.q(spyFn2),
        ];
        asap.c = 1;
        await Promise.all(proms);
        expect(spyFn1.callCount).to.be.equal(1, "task 1 not called");
        expect(spyFn2.callCount).to.be.equal(1, "task 2 not called");
        expect(spyFn1.calledBefore(spyFn2)).to.be.equal(true, "tasks called in invalid order");
    }).timeout(50);
    it("should it be possible to pause the queue", async () => {
        const asap = new ASAP();
        expect(asap.c).to.be.equal(1);
        const spyFn1 = spy(() => delay(20));
        const spyFn2 = spy(() => delay(20));
        asap.q(spyFn1);
        asap.q(spyFn2);
        expect(spyFn1.callCount).to.be.equal(0, "task 1 called");
        expect(spyFn2.callCount).to.be.equal(0, "task 2 called");
        await delay(10);
        asap.c = 0;
        expect(spyFn1.callCount).to.be.equal(1, "task 1 not called");
        expect(spyFn2.callCount).to.be.equal(0, "task 2 called");
        await delay(20);
        expect(spyFn2.callCount).to.be.equal(0, "task 2 called");
    }).timeout(100);
    it("should the queue be consumed properly", async () => {
        const asap = new ASAP(false);
        const fn = () => delay(5);
        const spyFn1 = spy(fn);
        const spyFn2 = spy(fn);
        const spyFn3 = spy(fn);
        const spyFn4 = spy(fn);
        const prom = Promise.all([
            asap.q(spyFn1),
            asap.q(spyFn2),
            asap.q(spyFn3),
            asap.q(spyFn4),
        ]);
        asap.c = 1;
        await prom;
        expect(spyFn2.calledAfter(spyFn1)).to.be.equal(true);
        expect(spyFn3.calledAfter(spyFn2)).to.be.equal(true);
        expect(spyFn4.calledAfter(spyFn3)).to.be.equal(true);
    }).timeout(100);
    it("should the queue be consumed properly - concurrency of 2", async () => {
        const asap = new ASAP(false);
        const spyFn1 = spy(() => delay(40));
        const spyFn2 = spy(() => delay(35));
        const spyFn3 = spy(() => delay(30));
        const spyFn4 = spy(() => delay(25));
        const spyFn5 = spy(() => delay(20));
        const spyFn6 = spy(() => delay(15));
        const spyFn7 = spy(() => delay(10));
        const spyFn8 = spy(() => delay(5));
        const spyFn9 = spy(() => delay(5));
        /**
         * 1=======4====5===89
         * 2======3=====6==7=
         */
        const prom = Promise.all([
            asap.q(spyFn1).then(() => {
                expect(spyFn2.callCount).to.be.equal(1, "#2 not called before #1 finished");
                expect(spyFn3.callCount).to.be.equal(1, "#3 not called before #1 finished");
                expect(spyFn4.callCount).to.be.equal(0, "#4 called before #1 finished");
            }),
            asap.q(spyFn2).then(() => {
                expect(spyFn1.callCount).to.be.equal(1, "#1 not called before #2 finished");
                expect(spyFn3.callCount).to.be.equal(0, "#3 called before #2 finished");
                expect(spyFn4.callCount).to.be.equal(0, "#4 called before #2 finished");
            }),
            asap.q(spyFn3).then(() => {
                expect(spyFn2.callCount).to.be.equal(1, "#2 not called before #3 finished");
                expect(spyFn4.callCount).to.be.equal(1, "#4 not called before #3 finished");
            }),
            asap.q(spyFn4).then(() => {
                expect(spyFn3.callCount).to.be.equal(1, "#3 not called before #4 finished");
            }),
            asap.q(spyFn5).then(() => {
                expect(spyFn7.callCount).to.be.equal(1, "#7 not called before #5 finished");
                expect(spyFn8.callCount).to.be.equal(0, "#8 called before #5 finished");
            }),
            asap.q(spyFn6).then(() => {
                expect(spyFn5.callCount).to.be.equal(1, "#5 not called before #6 finished");
                expect(spyFn7.callCount).to.be.equal(0, "#7 called before #6 finished");
                expect(spyFn8.callCount).to.be.equal(0, "#5 called before #6 finished");
            }),
            asap.q(spyFn7).then(() => {
                expect(spyFn8.callCount).to.be.equal(1, "#8 not called before #7 finished");
            }),
            asap.q(spyFn8).then(() => {
                expect(spyFn7.callCount).to.be.equal(1, "#7 not called before #8 finished");
            }),
            asap.q(spyFn9),
        ]);
        asap.c = 2;
        await prom;
    }).timeout(500);
    it("should the queue be consumed properly - concurrency of 3", async () => {
        const asap = new ASAP(false);
        const spyFn1 = spy(() => delay(40));
        const spyFn2 = spy(() => delay(5));
        const spyFn3 = spy(() => delay(30));
        const spyFn4 = spy(() => delay(15));
        const spyFn5 = spy(() => delay(20));
        const spyFn6 = spy(() => delay(25));
        const spyFn7 = spy(() => delay(10));
        const spyFn8 = spy(() => delay(35));
        const spyFn9 = spy(() => delay(5));
        /**
         * 1=======7=9
         * 24==5===8======
         * 3=====6====
         */
        const prom = Promise.all([
            asap.q(spyFn1).then(() => {
                expect(spyFn2.callCount).to.be.equal(1, "#2 not called before #1 finished");
                expect(spyFn3.callCount).to.be.equal(1, "#3 not called before #1 finished");
                expect(spyFn4.callCount).to.be.equal(1, "#4 not called before #1 finished");
                expect(spyFn5.callCount).to.be.equal(1, "#5 not called before #1 finished");
                expect(spyFn6.callCount).to.be.equal(1, "#6 not called before #1 finished");
                expect(spyFn7.callCount).to.be.equal(0, "#7 called before #1 finished");
                expect(spyFn8.callCount).to.be.equal(0, "#8 called before #1 finished");
                expect(spyFn9.callCount).to.be.equal(0, "#9 called before #1 finished");
            }),
            asap.q(spyFn2).then(() => {
                expect(spyFn1.callCount).to.be.equal(1, "#1 not called before #2 finished");
                expect(spyFn2.callCount).to.be.equal(1, "#2 not called before #2 finished");
                expect(spyFn3.callCount).to.be.equal(1, "#3 not called before #2 finished");
                expect(spyFn4.callCount).to.be.equal(0, "#4 called before #2 finished");
            }),
            asap.q(spyFn3).then(() => {
                expect(spyFn5.callCount).to.be.equal(1, "#5 not called before #3 finished");
                expect(spyFn8.callCount).to.be.equal(0, "#8 called before #3 finished");
            }),
            asap.q(spyFn4).then(() => {
                expect(spyFn1.callCount).to.be.equal(1, "#1 not called before #4 finished");
                expect(spyFn2.callCount).to.be.equal(1, "#2 not called before #4 finished");
                expect(spyFn3.callCount).to.be.equal(1, "#3 not called before #4 finished");
                expect(spyFn5.callCount).to.be.equal(0, "#5 called before #4 finished");
                expect(spyFn6.callCount).to.be.equal(0, "#6 called before #4 finished");
                expect(spyFn7.callCount).to.be.equal(0, "#7 called before #4 finished");
            }),
            asap.q(spyFn5).then(() => {
                expect(spyFn6.callCount).to.be.equal(1, "#6 not called before #5 finished");
                expect(spyFn9.callCount).to.be.equal(0, "#9 called before #5 finished");
            }),
            asap.q(spyFn6).then(() => {
                expect(spyFn7.callCount).to.be.equal(1, "#7 not called before #6 finished");
                expect(spyFn8.callCount).to.be.equal(1, "#8 not called before #6 finished");
                expect(spyFn9.callCount).to.be.equal(1, "#9 not called before #6 finished");
            }),
            asap.q(spyFn7).then(() => {
                expect(spyFn8.callCount).to.be.equal(1, "#8 not called before #7 finished");
                expect(spyFn9.callCount).to.be.equal(0, "#9 called before #7 finished");
            }),
            asap.q(spyFn8).then(() => {
                expect(spyFn9.callCount).to.be.equal(1, "#9 not called before #8 finished");
            }),
            asap.q(spyFn9),
        ]);
        asap.c = 3;
        await prom;
    }).timeout(500);
});
