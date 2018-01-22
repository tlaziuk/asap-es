export type task<T = any> = () => T | PromiseLike<T>;

/** key for heap of all promises */
const heap = Symbol();
type THeap = Array<() => Promise<any>>;

/** key for process method */
const process = Symbol();
type TProcess = () => void;

/** key for pending promises */
const pending = Symbol();
type TPending = THeap;

/** key for completed promises */
const complete = Symbol();
type TComplete = WeakMap<() => Promise<any>, Promise<any>>;

/** key for concurrency level */
const concurrency = Symbol();

export default class ASAP {
    /**
     * array of functions which returns promises
     */
    // @ts-ignore no built-in symbol
    protected [heap] = [] as Array<() => Promise<any>>;

    /**
     * WeakMap of resolved or rejected promises
     */
    // @ts-ignore no built-in symbol
    protected [complete] = new WeakMap<() => Promise<any>, Promise<any>>();

    /**
     * array of pending/running promise methods
     */
    // @ts-ignore no built-in symbol
    protected [pending] = [] as Array<() => Promise<any>>;

    /**
     * concurrency protected var
     */
    // @ts-ignore no built-in symbol
    protected [concurrency]: number = 1;

    /**
     * set concurrency
     */
    public set c(v: number) {
        if (v < 1) {
            throw new Error(`concurrency can not be lower than 1`);
        }
        (this as any)[concurrency] = v;
        (this as any)[process]();
    }

    /**
     * get concurrency
     */
    public get c(): number {
        return (this as any)[concurrency];
    }

    /**
     * enqueue a new task
     * @param fn function to run
     */
    public q<T>(fn: task<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const promFn = () => {
                const prom = new Promise<T>((result) => { result(fn()); });
                const delFn = () => { (this as any)[complete].set(promFn, prom); };
                return prom.then(resolve, reject).then(delFn, delFn);
            };
            (this as any)[heap].push(promFn);
            (this as any)[process]();
        });
    }

    /**
     * process the queue
     */
    protected [process](): void {
        if (((this as any)[pending] as TPending).filter((v) => v).length < (this as any)[concurrency]) {
            ((this as any)[heap] as THeap).filter(
                (v) => !(this as any)[complete].has(v) && (this as any)[pending].indexOf(v) < 0,
            ).slice(0, (this as any)[concurrency]).map((v) => {
                (this as any)[pending].push(v);
                const delFn = () => { delete (this as any)[pending][(this as any)[pending].indexOf(v)]; };
                return v().then(delFn, delFn);
            }).forEach((prom) => {
                prom.then(() => { (this as any)[process](); });
            });
        }
    }
}
