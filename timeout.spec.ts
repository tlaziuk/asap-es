import {
    expect,
} from "chai";

import {
    spy,
} from "sinon";

import ASAP from ".";
import delay from "./delay";
import timeout from "./timeout";

describe(timeout.name || "timeout", () => {
    it("should return a 'function'", () => {
        expect(timeout(0, () => void 0)).to.be.a("function");
    });
    it("should the task function be called", async () => {
        const taskSpy = spy();
        const taskNew = timeout(0, taskSpy);
        try {
            await taskNew();
        } catch {
            // pass
        }
        expect(taskSpy.callCount).to.be.equal(1);
    });
    it("should the new task resolve to value of original task", async () => {
        const task = () => "abc";
        const taskNew = timeout(0, task);
        expect(await taskNew()).to.be.equal("abc");
    });
    it("should the new task reject when execution time exceeds the timeout", (done) => {
        const task = () => new Promise<void>(
            (resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 10);
            },
        );
        const taskNew = timeout(0, task);
        taskNew().catch(() => done());
    });
    it("should the waiting time for task not count into the task execution time", async () => {
        const task = delay(10, (): string => "abc");
        const taskNew = timeout(0, task);
        expect(await taskNew()).to.be.equal("abc");
    });
    it("should rejection be instance of 'Error'", async () => {
        const task = () => delay(10, "abc");
        const taskNew = timeout(0, task);
        let err;
        try {
            await taskNew();
        } catch (e) {
            err = e;
        }
        expect(err).to.be.instanceOf(Error);
    });
    it("should reject if task Promise rejects", (done) => {
        const task = () => Promise.reject(new Error());
        const taskNew = timeout(10, task);
        taskNew().catch(() => done());
    });
    it("should be working in a queue", async () => {
        const queue = new ASAP();
        expect(await queue.q(timeout(10, () => delay(5, "abc")))).to.be.equal("abc");
    });
    it("should reject if task throws", async () => {
        const task = () => { throw new Error("error"); };
        const taskNew = timeout(10, task);
        let err;
        try {
            await taskNew();
        } catch (e) {
            err = e;
        }
        expect(err).to.be.instanceOf(Error);
        expect((err as Error).message).to.be.equal("error");
    });
    it("should reject on timeout with custom reason", async () => {
        const task = timeout(10, () => delay(20, "abc"), "timeout");
        const queue = new ASAP();
        await queue.q(task).then(
            () => { throw new Error(); },
            (reason) => {
                expect(reason).to.be.instanceOf(Error);
                expect(reason).to.have.property("message").equal("timeout");
            },
        );
    });
});
