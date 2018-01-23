/**
 * delay the execution by given amount of time
 *
 * @param delay time in milliseconds
 * @param val optional value to return
 */
export default <T = void>(delay: number, val?: T | PromiseLike<T>) => new Promise<T>(
    (resolve) => {
        setTimeout(() => {
            resolve(val);
        }, delay);
    },
);
