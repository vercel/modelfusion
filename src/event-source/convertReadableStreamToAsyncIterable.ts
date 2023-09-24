export async function* convertReadableStreamToAsyncIterable<T>(
  reader: ReadableStreamDefaultReader<T>
): AsyncIterable<T> {
  while (true) {
    const result = await reader.read();

    if (result.done) {
      break;
    }

    yield result.value;
  }
}
