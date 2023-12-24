// TODO once Array.fromAsync is in Node.js,
// use Array.fromAsync instead of this function
export async function arrayFromAsync<T>(
  iterable: AsyncIterable<T>
): Promise<T[]> {
  const result = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}
