import { test, expect } from "vitest";
import { AsyncQueue } from "./AsyncQueue.js";

test("receive values in order for single iterator", async () => {
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

test("throw error when pushing to a closed queue", async () => {
  const asyncQueue = new AsyncQueue<number>();
  asyncQueue.close();
  expect(() => asyncQueue.push(1)).toThrowError("Pushing to a closed queue");
});
