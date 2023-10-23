export class AsyncQueue<T> implements AsyncIterable<T> {
  private values: T[] = [];
  private consumers: Array<{
    position: number;
  }> = [];
  private pendingResolvers: Array<(result: IteratorResult<T>) => void> = [];

  private closed: boolean = false;

  push(value: T): void {
    if (this.closed) {
      throw new Error("Pushing to a closed queue");
    }

    this.values.push(value);

    for (const resolver of this.pendingResolvers) {
      resolver({ value, done: false });
    }
  }

  close(): void {
    this.closed = true;

    for (const resolver of this.pendingResolvers) {
      resolver({ value: undefined as any, done: true }); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    const consumer = { position: 0 };

    this.consumers.push(consumer);

    return {
      next: (): Promise<IteratorResult<T>> => {
        if (consumer.position < this.values.length) {
          // If the consumer is behind the current position, give them the next value:
          const value = this.values[consumer.position++];
          return Promise.resolve({ value, done: false });
        } else if (this.closed) {
          // using 'as any' to bypass TypeScript error for 'undefined':
          return Promise.resolve({ value: undefined as any, done: true }); // eslint-disable-line @typescript-eslint/no-explicit-any
        } else {
          // The consumer has to wait for new values to be pushed:
          return new Promise((resolve) => {
            this.pendingResolvers.push(resolve);
            consumer.position++;
          });
        }
      },
    };
  }
}
