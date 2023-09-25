export class AsyncQueue<T> implements AsyncIterable<T> {
  private queue: T[] = [];
  private resolvers: Array<(result: IteratorResult<T>) => void> = [];
  private closed: boolean = false;

  push(value: T) {
    if (this.closed) {
      throw new Error("Pushing to a closed queue");
    }

    const resolve = this.resolvers.shift();
    if (resolve) {
      resolve({ value, done: false });
    } else {
      this.queue.push(value);
    }
  }

  close() {
    while (this.resolvers.length) {
      const resolve = this.resolvers.shift();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve?.({ value: undefined as any, done: true });
    }
    this.closed = true;
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: (): Promise<IteratorResult<T>> => {
        if (this.queue.length > 0) {
          return Promise.resolve({
            value: this.queue.shift() as T,
            done: false,
          });
        } else if (this.closed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return Promise.resolve({ value: undefined as any, done: true });
        } else {
          return new Promise((resolve) => {
            this.resolvers.push(resolve);
          });
        }
      },
    };
  }
}
