import { expect } from "chai";
import { from, Observable } from "rxjs";
import ASAP, { IASAP } from ".";
import toObservable from "./toObservable";

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
});
