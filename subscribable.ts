import { InteropObservable } from "rxjs";
import ASAP from ".";
import toSubscribable from "./toSubscribable";

export default class SubscribableASAP extends ASAP implements InteropObservable<any> {
    public [Symbol.observable] = toSubscribable.bind(this);
}
