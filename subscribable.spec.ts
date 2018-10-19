import { expect } from "chai";
import { from, Observable } from "rxjs";
import ASAP from ".";
import SubscribableASAP from "./subscribable";

describe(SubscribableASAP.name || "SubscribableASAP", () => {
    it(`should be a ${Function.name}`, () => {
        expect(SubscribableASAP).to.be.a("function");
    });
    it(`should create ${ASAP.name || "ASAP"} instance`, () => {
        expect(new SubscribableASAP()).to.be.instanceOf(ASAP);
    });
    it(`should be possible to create ${Observable.name}`, () => {
        const instance = new SubscribableASAP();

        expect(from(instance)).to.be.instanceOf(Observable);
    });
});
