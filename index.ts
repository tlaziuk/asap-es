/**
 * task function
 *
 * example:
 * ``` typescript
 * () => import("fs").then((fs) => fs.readFileSync("/path/to/a/file"));
 * ```
 */
export type task<T = any> = () => T | PromiseLike<T>;

export interface IASAP {
    /**
     * concurrency value
     * @throws will throw an error if concurrency value is invalid
     */
    c: number;

    /**
     * enqueue a new task
     * @param fn task to run
     * @param priority task priority, smaller value means higher priority
     * @returns a Promise resolves when the task gets executed
     *
     * example:
     * ``` typescript
     * for (let x of listOfUrls) {
     *     asap.q(() => fetch(x).then((res) => res.blob())); // Promise<Blob>
     * }
     * ```
     */
    q<T>(fn: task<T> | PromiseLike<task<T>>, priority?: number): Promise<T>;
}

function ASAP(this: any): any {
    /**
     * check if this function is used as a constructor
     */
    if (!(this instanceof ASAP)) {
        return new (ASAP as any)();
    }

    /**
     * key for concurrency level
     */
    let concurrency: number = 1;

    /**
     * array of functions which returns promises
     */
    const heap = [] as Array<[() => Promise<any>, number]>;

    /**
     * Set of resolved or rejected promise methods
     */
    const complete = new Set<() => Promise<any>>();

    /**
     * Set of pending/running promise methods
     */
    const pending = new Set<() => Promise<any>>();

    /**
     * process the queue
     */
    const process = (): void => {
        if (pending.size < concurrency) {
            heap.filter(
                // filter the heap to get only not completed nor pending (running) tasks
                ([v]) => !complete.has(v) && !pending.has(v),
            ).sort(
                // sort the heap from highest to lowest priority
                ([, a], [, b]) => a - b,
            ).slice(
                0,
                concurrency, // slice the array to the size of concurrency value
            ).forEach(([v]) => {
                // mark the promise function as pending
                pending.add(v);

                v().then(
                    () => {
                        // delete the promise function from pending list
                        pending.delete(v);

                        // process the task list as this task has just finished
                        process();
                    },
                );
            });
        }
    };

    Object.defineProperties(this, {
        c: {
            get: () => concurrency,
            set: (value: number) => {
                if (value < 1) {
                    throw new Error("concurrency can not be lower than 1");
                }
                // set the new concurrency level
                concurrency = value;
                // process the heap as concurrency level changed
                process();
            },
        },
        q: {
            value: <T>(fn: task<T> | PromiseLike<task<T>>, priority?: number) => new Promise<T>((resolve, reject) => {
                const promFn = () => {
                    // create a new promise in case when the `fn` throws anything
                    const prom = Promise.resolve(fn).then((v) => v());

                    // react on `fn` resolution and set the promise as completed
                    return prom.then(resolve, reject).then(() => { complete.add(promFn); });
                };

                // push the promise function and priority to the task list
                heap.push([promFn, priority || 0]);

                // process the task list
                process();
            }),
        },
    });
}

export default (ASAP as any) as {
    new(): IASAP;
    (): IASAP;
};
