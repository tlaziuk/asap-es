import { task } from ".";

/**
 * reject when the execution exceeds given time
 *
 * @param timeout time in milliseconds
 * @param fn task to run
 * @param reason timeout rejection reason
 */
export default <T = any>(
    timeout: number | PromiseLike<number>,
    fn: task<T> | PromiseLike<task<T>>,
    reason?: string | PromiseLike<string>,
): (() => Promise<T>) => () => Promise.all([timeout, fn, reason as string | undefined]).then(
    // run the logic when task will be ready
    ([timeoutResolved, taskResolved, reasonResolved]) => new Promise<T>(
        (resolve, reject) => {
            Promise.resolve(
                // task is ready, yet it may return a promise
                taskResolved(),
            ).then(
                resolve,
                reject,
            );
            setTimeout(() => {
                // reject when the timeout is reached
                reject(new Error(reasonResolved));
            }, timeout);
        },
    ),
);
