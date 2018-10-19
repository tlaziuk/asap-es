import { Subscribable, Unsubscribable } from "rxjs";
import { IASAP } from ".";

export default function toSubscribable(this: IASAP): Subscribable<any> {
    return {
        subscribe: (): Unsubscribable => {
            return {
                unsubscribe: () => {
                    // pass
                },
            };
        },
    };
}
