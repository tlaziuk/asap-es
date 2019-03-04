import { InteropObservable, Observer, PartialObserver } from "rxjs";
import { IASAP } from ".";

const symbolObservable = typeof Symbol === "function" && Symbol.observable || "@@observable";

const noop = () => {
    // empty function
};

const getFn = (
    val: any,
    bind?: any,
): (() => any) => typeof val === "function" ? (typeof bind === "undefined" ? val : val.bind(val)) : noop;

const makeObserver = <T>(
    next?: PartialObserver<T> | ((value: T) => void),
    error?: ((error: any) => void),
    complete?: (() => void),
): Observer<T> => {
    let observer: Observer<T>;
    if (typeof next === "object" && next !== null) {
        observer = {
            complete: getFn(next.complete, next),
            error: getFn(next.error, next),
            next: getFn(next.next, next),
        };
        Object.defineProperty(
            observer,
            "closed",
            {
                get: () => next.closed,
                set: (_: any) => { next.closed = _; },
            },
        );
    } else {
        observer = {
            complete: getFn(complete),
            error: getFn(error),
            next: getFn(next),
        };
    }
    return observer;
};

export default (asap: IASAP): IASAP & InteropObservable<any> => {
    if (!asap.hasOwnProperty(symbolObservable)) {
        Object.defineProperty(
            asap,
            symbolObservable,
            {
                enumerable: false,
                value(
                    this: IASAP,
                    next?: PartialObserver<any> | ((value: any) => void),
                    error?: ((error: any) => void),
                    complete?: (() => void),
                ) {
                    const observer = makeObserver(next, error, complete);

                    const handle = this.h((res, err, completed) => {
                        if (!observer.closed) {
                            if (completed) {
                                observer.complete();
                            } else if (typeof err !== "undefined") {
                                observer.error(err);
                            } else {
                                observer.next(res);
                            }
                        }
                    });

                    return {
                        unsubscribe: () => {
                            this.r(handle);
                        },
                    };
                },
                writable: false,
            },
        );
    }

    return asap as any;
};
