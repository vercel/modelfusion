export class AsyncQueue<T> implements AsyncIterable<T | undefined> {
  queue: T[];
  resolvers: Array<(options: { value: T | undefined; done: boolean }) => void> =
    [];
  closed: boolean;

  constructor() {
    this.queue = [];
    this.resolvers = [];
    this.closed = false;
  }

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
      resolve?.({ value: undefined, done: true });
    }
    this.closed = true;
  }

  [Symbol.asyncIterator]() {
    return {
      next: (): Promise<IteratorResult<T | undefined, T | undefined>> => {
        if (this.queue.length > 0) {
          return Promise.resolve({ value: this.queue.shift(), done: false });
        } else if (this.closed) {
          return Promise.resolve({ value: undefined, done: true });
        } else {
          return new Promise((resolve) => this.resolvers.push(resolve));
        }
      },
    };
  }
}
