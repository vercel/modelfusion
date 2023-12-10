import { delay } from "./delay.js";
import { AsyncQueue } from "./AsyncQueue.js";

it("should receive values in order for single iterator created before pushing", async () => {
  const asyncQueue = new AsyncQueue<number>();

  const receivedValues: number[] = [];
  const receiveValuesPromise = (async () => {
    for await (const value of asyncQueue) {
      receivedValues.push(value);
    }
  })();

  asyncQueue.push(1);
  asyncQueue.push(2);
  asyncQueue.push(3);
  asyncQueue.close();

  await receiveValuesPromise;

  expect(receivedValues).toEqual([1, 2, 3]);
});

it("should receive values in order for single iterator created after closing", async () => {
  const asyncQueue = new AsyncQueue<number>();

  asyncQueue.push(1);
  asyncQueue.push(2);
  asyncQueue.push(3);
  asyncQueue.close();

  const receivedValues: number[] = [];
  const receiveValuesPromise = (async () => {
    for await (const value of asyncQueue) {
      receivedValues.push(value);
    }
  })();

  await receiveValuesPromise;

  expect(receivedValues).toEqual([1, 2, 3]);
});

it("should handle delayed pushing", async () => {
  const asyncQueue = new AsyncQueue<number>();

  setTimeout(() => {
    asyncQueue.push(1);
    asyncQueue.push(2);
    asyncQueue.close();
  }, 5);

  const receivedValues: number[] = [];
  for await (const value of asyncQueue) {
    receivedValues.push(value);
  }

  expect(receivedValues).toEqual([1, 2]);
});

it("should error handling in consumer", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.push(1);

  await expect(
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _value of asyncQueue) {
        throw new Error("Consumer error");
      }
    })()
  ).rejects.toThrow("Consumer error");

  // Check the queue is still operational after an error in the consumer
  asyncQueue.push(2);
  asyncQueue.close();

  const receivedValues: number[] = [];
  for await (const value of asyncQueue) {
    receivedValues.push(value);
  }

  expect(receivedValues).toEqual([1, 2]);
});

it("should behavior on empty queue closing", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.close();

  const receivedValues: number[] = [];
  for await (const value of asyncQueue) {
    receivedValues.push(value);
  }

  expect(receivedValues).toEqual([]);
});

it("should multiple closings", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.close();
  expect(() => asyncQueue.close()).not.toThrow();
});

it("should receive all values in multiple independent consumers", async () => {
  const asyncQueue = new AsyncQueue<number>();

  const consumerPromises = [1, 2].map(async () => {
    const receivedValues: number[] = [];
    for await (const value of asyncQueue) {
      receivedValues.push(value);
    }
    return receivedValues;
  });

  await delay(5);
  asyncQueue.push(1);
  await delay(5);
  asyncQueue.push(2);
  await delay(5);
  asyncQueue.push(3);
  await delay(5);
  asyncQueue.close();

  const allReceivedValues = await Promise.all(consumerPromises);

  allReceivedValues.forEach((receivedValues) => {
    expect(receivedValues).toEqual([1, 2, 3]);
  });
});

it("should each consumer receives all pushed values under varying conditions", async () => {
  const asyncQueue = new AsyncQueue<number>();

  // Start the first consumer, which will await values.
  const receivedValues1: number[] = [];
  const consumer1 = (async () => {
    for await (const value of asyncQueue) {
      receivedValues1.push(value);
    }
  })();

  // Simulate some operation delay, then push the first value.
  await delay(5); // Delay is necessary to simulate real-world async operations.
  asyncQueue.push(1);

  // Start the second consumer after the first value was pushed.
  const receivedValues2: number[] = [];
  const consumer2 = (async () => {
    for await (const value of asyncQueue) {
      receivedValues2.push(value);
    }
  })();

  // Push the remaining values with some delays.
  await delay(5);
  asyncQueue.push(2);
  asyncQueue.push(3);

  // Close the queue and wait for consumers to finish processing.
  await delay(5);
  asyncQueue.close();

  await Promise.all([consumer1, consumer2]);

  // Both consumers should have received all values, even if they started at different times.
  expect(receivedValues1).toEqual([1, 2, 3]);
  expect(receivedValues2).toEqual([1, 2, 3]); // This will likely fail because consumer2 started late.
});

it("should throw error when pushing to a closed queue", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.close();
  expect(() => asyncQueue.push(1)).toThrowError(
    "Cannot push value to closed queue."
  );
});
