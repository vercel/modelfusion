import { DeltaEvent } from "./DeltaEvent.js";

export async function* extractTextDelta<FULL_DELTA>(
  deltaIterable: AsyncIterable<DeltaEvent<FULL_DELTA>>,
  extractDelta: (fullDelta: FULL_DELTA) => string | undefined
): AsyncIterable<string> {
  for await (const event of deltaIterable) {
    if (event?.type === "error") {
      throw event.error;
    }

    if (event?.type === "delta") {
      const delta = extractDelta(event.fullDelta);

      if (delta != null && delta.length > 0) {
        yield delta;
      }
    }
  }
}
