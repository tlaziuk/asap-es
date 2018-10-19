/**
 * task function
 *
 * example:
 * ``` typescript
 * () => import("fs").then((fs) => fs.readFileSync("/path/to/a/file"));
 * ```
 */
export type Task<T = any> = () => T | PromiseLike<T>;

export type EventFunction<T = any, E extends Error = Error> = (result?: T, error?: E) => void;

export interface IASAP {
    /**
     * concurrency level
     *
     * `< 1` to pause the instance, `>= 1` otherwise
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
    q<T>(fn: Task<T> | PromiseLike<Task<T>>, priority?: number): Promise<T>;

    /**
     * add a function which will be executed each time when one of the following happens:
     * * task success
     * * task failure
     *
     * @returns a handle to remove the function
     */
    h(fn: EventFunction): symbol;

    r(handle: symbol): void;
}

function ASAP(this: any, c: boolean | number = 1): any {
    /**
     * check if this function is used as a constructor
     */
    if (!(this instanceof ASAP)) {
        return new (ASAP as any)(c);
    }

    /**
     * concurrency level
     */
    let concurrency: number;

    /**
     * Set of functions which returns promises with priority
     */
    const heap = new Set<[() => Promise<any>, number]>();

    /**
     * Set of pending/running promise methods
     */
    const pending = new Set<() => Promise<any>>();

    /**
     * process the queue
     */
    const process = (): void => {
        const { size } = pending;
        if (size < concurrency) {
            Array.from(heap).sort(
                // sort the heap from highest to lowest priority
                ([, a], [, b]) => a - b,
            ).slice(
                0,
                concurrency - size, // slice the array to the size of left concurrency value
            ).forEach((heapItem) => {
                const [v] = heapItem;

                // delete
                heap.delete(heapItem);

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
                // set the new concurrency level
                concurrency = Math.max(Math.floor(value), 0);

                // process the heap as concurrency level changed
                process();
            },
        },
        q: {
            value: <T>(fn: Task<T> | PromiseLike<Task<T>>, priority?: number) => new Promise<T>((resolve, reject) => {
                const promFn = () => {
                    // create a new promise in case when the `fn` throws anything
                    const prom = Promise.resolve(fn).then((v) => v());

                    // react on `fn` resolution and set the promise as completed
                    return prom.then(resolve, reject);
                };

                // push the promise function and priority to the task list
                heap.add([promFn, priority || 0]);

                // process the task list
                process();
            }),
        },
    });

    // assign passed concurrency to the instance
    this.c = c;
}

export default (ASAP as any) as {
    /**
     * @param concurrency `false` or `< 1` if instance should be paused, `>= 1` for instance with given concurrency
     */
    new(concurrency?: boolean | number): IASAP;
    /**
     * @param concurrency `false` or `< 1` if instance should be paused, `>= 1` for instance with given concurrency
     */
    (concurrency?: boolean | number): IASAP;
};
