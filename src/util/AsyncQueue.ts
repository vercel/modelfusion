/**
 * `AsyncQueue` is a class that represents an asynchronous queue.
 * It allows values to be pushed onto it and consumed (pulled) by an iterator.
 * The queue is async-iterable, making it compatible with async/await syntax.
 *
 * @template T The type of elements contained in the queue.
 * @example
 * const queue = new AsyncQueue<number>();
 * queue.push(1);
 * (async () => {
 *   for await (const value of queue) {
 *     console.log(value);
 *   }
 * })();
 */
export class AsyncQueue<T> implements AsyncIterable<T> {
  private values: T[] = [];
  private pendingResolvers: Array<() => void> = [];
  private closed: boolean = false;

  /**
   * Pushes an element onto the queue. If the queue is closed, an error is thrown.
   *
   * @param {T} value - The element to add to the queue.
   * @throws {Error} Throws an error if the queue is closed.
   * @example
   * queue.push(2);
   */
  push(value: T): void {
    if (this.closed) {
      throw new Error(
        "Cannot push value to closed queue. The queue has been closed and is no longer accepting new items."
      );
    }

    this.values.push(value);

    while (this.pendingResolvers.length > 0) {
      this.pendingResolvers.shift()?.();
    }
  }

  /**
   * Closes the queue, preventing more elements from being pushed onto it.
   * Any pending iterators are resolved with `{ value: undefined, done: true }`.
   *
   * @example
   * queue.close();
   */
  close(): void {
    this.closed = true;

    while (this.pendingResolvers.length > 0) {
      this.pendingResolvers.shift()?.();
    }
  }

  /**
   * Creates and returns an async iterator that allows the queue to be consumed.
   * This is part of the AsyncIterable protocol.
   * You can create multiple iterators for the same queue.
   *
   * @returns {AsyncIterator<T>} An async iterator for the queue.
   * @example
   * (async () => {
   *   for await (const value of queue) {
   *     console.log(value);
   *   }
   * })();
   */
  [Symbol.asyncIterator](): AsyncIterator<T> {
    let position = 0;

    return {
      next: (): Promise<IteratorResult<T>> =>
        new Promise((resolve) => {
          const attemptResolve = () => {
            if (position < this.values.length) {
              // There's an available value, resolve it immediately.
              resolve({ value: this.values[position++], done: false });
            } else if (this.closed) {
              // The queue is closed, and there are no more values. Complete the iteration.
              resolve({ value: undefined as any, done: true }); // eslint-disable-line @typescript-eslint/no-explicit-any
            } else {
              // No values are currently available, and the queue is not closed.
              // The consumer is now pending and will be resolved when a new value is pushed
              // or when the queue is closed.
              this.pendingResolvers.push(attemptResolve);
            }
          };

          attemptResolve();
        }),
    };
  }
}
