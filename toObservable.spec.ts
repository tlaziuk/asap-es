import { expect } from "chai";
import { from, Observable, Unsubscribable } from "rxjs";
import { finalize } from "rxjs/operators";
import { SinonSpy, spy } from "sinon";
import ASAP, { IASAP } from ".";
import toObservable from "./toObservable";

const subscribeStub = (
    observable: Observable<any>,
    nextSpy?: SinonSpy,
    errorSpy?: SinonSpy,
    completeSpy?: SinonSpy,
) => new Promise<Unsubscribable | undefined>((resolve) => {
    const subscription = observable.pipe(
        finalize(() => { resolve(subscription); }),
    ).subscribe(nextSpy, errorSpy, completeSpy);
}).then((subscription) => { if (subscription) { subscription.unsubscribe(); } });

describe(toObservable.name || "toObservable", () => {
    let asapInstance: IASAP;

    beforeEach(() => {
        asapInstance = new ASAP();
    });

    it(`should be a ${Function.name}`, () => {
        expect(toObservable).to.be.a("function");
    });

    it(`should return ${ASAP.name || "ASAP"} instance`, () => {
        expect(toObservable(asapInstance)).to.be.instanceOf(ASAP);
    });

    it(`should be possible to create ${Observable.name}`, () => {
        expect(from(toObservable(asapInstance))).to.be.instanceOf(Observable);
    });

    it(`should be possible to call multiple times with the same instance`, () => {
        expect(toObservable(asapInstance)).to.be.equal(asapInstance);
        expect(toObservable(asapInstance)).to.be.equal(asapInstance);
    });

    it(`should be possible to emit a value to ${Observable.name}`, async () => {
        const observable = from(toObservable(asapInstance));
        const nextSpy = spy();
        const errorSpy = spy();

        await Promise.all([
            subscribeStub(observable, nextSpy, errorSpy),
            asapInstance.q(() => 2),
        ]);

        expect(nextSpy.callCount).to.be.equal(1);
        expect(nextSpy.firstCall.args[0]).to.be.equal(2);

        expect(errorSpy.callCount).to.be.equal(0);
    });

    it(`should be possible to emit an error ${Observable.name}`, async () => {
        const observable = from(toObservable(asapInstance));
        const nextSpy = spy();
        const errorSpy = spy();

        const error = new Error();

        await Promise.all([
            subscribeStub(observable, nextSpy, errorSpy),
            asapInstance.q(() => { throw error; }).catch(() => void 0),
        ]);

        expect(nextSpy.callCount).to.be.equal(0);

        expect(errorSpy.callCount).to.be.equal(1);
        expect(errorSpy.firstCall.args[0]).to.be.equal(error);
    });
});
