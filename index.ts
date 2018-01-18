// tslint:disable:eofline

export default class ASAP {
    /**
     * array of functions which returns promises
     */
    protected queue = [] as Array<() => Promise<any>>;

    /**
     * WeakMap of resolved or rejected promises
     */
    protected prom = new WeakMap<() => Promise<any>, Promise<any>>();

    /**
     * array of pending/running promise methods
     */
    protected pending = [] as Array<() => Promise<any>>;

    /**
     * concurrency protected var
     */
    protected c: number = 1;

    /**
     * set concurrency
     */
    public set concurrency(v: number) {
        if (v < 1) {
            throw new Error(`concurrency can not be lower than 1`);
        }
        this.c = v;
        this.process();
    }

    /**
     * get concurrency
     */
    public get concurrency(): number {
        return this.c;
    }

    /**
     * enqueue a new task
     * @param fn function to run
     */
    public enqueue<T>(fn: () => T | PromiseLike<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const promFn = async () => {
                const prom = new Promise<T>((result) => { result(fn()); });
                prom.then(resolve, reject);
                try {
                    await prom;
                } catch {
                    // pass
                } finally {
                    this.prom.set(promFn, prom);
                }
            };
            this.queue.push(promFn);
            this.process();
        });
    }

    /**
     * process the queue
     */
    public process(): void {
        if (this.pending.filter((v) => v).length < this.c) {
            this.queue.filter(
                (v) => !this.prom.has(v) && this.pending.indexOf(v) < 0,
            ).slice(0, this.c).map(async (v) => {
                this.pending.push(v);
                try {
                    await v();
                } catch {
                    // pass
                } finally {
                    delete this.pending[this.pending.indexOf(v)];
                }
            }).forEach((prom) => {
                prom.then(() => { this.process(); });
            });
        }
    }
}