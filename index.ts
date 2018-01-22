/**
 * task function
 */
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
    protected [heap] = [] as THeap;

    /**
     * WeakMap of resolved or rejected promises
     */
    // @ts-ignore no built-in symbol
    protected [complete] = new WeakMap<() => Promise<any>, Promise<any>>();

    /**
     * array of pending/running promise methods
     */
    // @ts-ignore no built-in symbol
    protected [pending] = [] as TPending;

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
        // set the new concurrency level
        (this as any)[concurrency] = v;

        // process the heap as concurrency level changed
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
                // create a new promise in case when the `fn` throws anything
                const prom = new Promise<T>((result) => { result(fn()); });

                // react on `fn` resolution and set the promise as completed
                return prom.then(resolve, reject).then(() => { (this as any)[complete].set(promFn, prom); });
            };

            // push the promise function to the task list
            (this as any)[heap].push(promFn);

            // process the task list
            (this as any)[process]();
        });
    }

    /**
     * process the queue
     */
    protected [process](): void {
        if (((this as any)[pending] as TPending).filter((v) => v).length < (this as any)[concurrency]) {
            ((this as any)[heap] as THeap).filter(
                // filter the heap to get only not completed nor pending (running) tasks
                // tslint:disable-next-line:max-line-length
                (v) => !((this as any)[complete] as TComplete).has(v) && ((this as any)[pending] as TPending).indexOf(v) < 0,
            ).slice(
                0,
                (this as any)[concurrency], // slice the array to the size of concurrency value
            ).forEach((v) => {
                // mark the promise function as pending
                (this as any)[pending].push(v);

                v().then(
                    () => {
                        // delete the promise function from pending list
                        delete (this as any)[pending][(this as any)[pending].indexOf(v)];

                        // process the task list as this task has just finished
                        (this as any)[process]();
                    },
                );
            });
        }
    }
}
