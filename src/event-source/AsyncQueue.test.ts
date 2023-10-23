import { test, expect } from "vitest";
import { AsyncQueue } from "./AsyncQueue.js";

test("receive values in order for single iterator created before pushing", async () => {
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

test("receive values in order for single iterator created after closing", async () => {
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

test("handle delayed pushing", async () => {
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

test("error handling in consumer", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.push(1);

  await expect(
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const value of asyncQueue) {
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

test("behavior on empty queue closing", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.close();

  const receivedValues: number[] = [];
  for await (const value of asyncQueue) {
    receivedValues.push(value);
  }

  expect(receivedValues).toEqual([]);
});

test("multiple closings", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.close();
  expect(() => asyncQueue.close()).not.toThrow();
});

test("receive all values in multiple independent consumers", async () => {
  const asyncQueue = new AsyncQueue<number>();

  const consumerPromises = [1, 2].map(async () => {
    const receivedValues: number[] = [];
    for await (const value of asyncQueue) {
      receivedValues.push(value);
    }
    return receivedValues;
  });

  asyncQueue.push(1);
  asyncQueue.push(2);
  asyncQueue.push(3);
  asyncQueue.close();

  const allReceivedValues = await Promise.all(consumerPromises);

  allReceivedValues.forEach((receivedValues) => {
    expect(receivedValues).toEqual([1, 2, 3]);
  });
});

test("throw error when pushing to a closed queue", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.close();
  expect(() => asyncQueue.push(1)).toThrowError("Pushing to a closed queue");
});
