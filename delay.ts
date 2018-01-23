/**
 * delay the execution by given amount of time
 *
 * @param delay time in milliseconds
 * @param val optional value to return
 */
export default <T = void>(delay: number, val?: T | PromiseLike<T> | (() => T | PromiseLike<T>)) => new Promise<T>(
    (resolve) => {
        setTimeout(() => {
            // create a new promise to handle errors thrown in function
            resolve(new Promise<T>((res) => {
                res(typeof val === "function" ? val() : val);
            }));
        }, delay);
    },
);
