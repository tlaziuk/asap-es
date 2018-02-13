import { task } from ".";

/**
 * reject when the execution exceeds given time
 *
 * @param timeout time in milliseconds
 * @param fn task to run
 * @param reason timeout rejection reason
 */
export default <T = any>(
    timeout: number,
    fn: task<T> | PromiseLike<task<T>>,
    reason?: string,
): (() => Promise<T>) => () => Promise.resolve(fn).then(
    // run the logic when task will be ready
    (taskFn) => new Promise<T>(
        (resolve, reject) => {
            Promise.resolve(
                // task is ready, yet it may return a promise
                taskFn(),
            ).then(resolve, reject);
            setTimeout(() => {
                // reject when the timeout is reached
                reject(new Error(reason));
            }, timeout);
        },
    ),
);
