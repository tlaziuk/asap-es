import { task } from ".";

/**
 * reject when the execution exceeds given time
 *
 * @param timeout time in milliseconds
 * @param fn task to run
 */
export default <T = any>(
    timeout: number,
    fn: task<T> | PromiseLike<task<T>>,
): (() => Promise<T>) => () => Promise.resolve(fn).then(
    (taskFn) => new Promise<T>(
        (resolve, reject) => {
            Promise.resolve(taskFn).then((v) => v()).then(resolve, reject);
            setTimeout(() => {
                reject(new Error());
            }, timeout);
        },
    ),
);
