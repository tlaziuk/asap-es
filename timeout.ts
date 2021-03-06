import { Task } from ".";

/**
 * reject when the execution exceeds given time
 *
 * @param timeout time in milliseconds
 * @param fn task to run
 * @param reason timeout rejection reason
 */
export default <T = any>(
    timeout: number | PromiseLike<number>,
    fn: Task<T> | PromiseLike<Task<T>>,
    reason?: string | PromiseLike<string>,
): (() => Promise<T>) => () => Promise.all([timeout, fn, reason as any]).then(
    // run the logic when task will be ready
    ([timeoutResolved, taskResolved, reasonResolved]) => new Promise<T>(
        (resolve, reject) => {
            Promise.resolve(
                // task is ready, yet it may return a promise
                taskResolved(),
            ).then(resolve, reject);

            setTimeout(
                () => {
                    // reject when the timeout is reached
                    reject(new Error(reasonResolved));
                },
                timeoutResolved,
            );
        },
    ),
);
