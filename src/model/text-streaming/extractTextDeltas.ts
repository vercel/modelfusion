import { DeltaEvent } from "./DeltaEvent.js";

export async function* extractTextDeltas<FULL_DELTA>({
  deltaIterable,
  extractDelta,
  onDone,
  onError,
}: {
  deltaIterable: AsyncIterable<DeltaEvent<FULL_DELTA>>;
  extractDelta: (fullDelta: FULL_DELTA) => string | undefined;
  onDone: (fullText: string, lastFullDelta: FULL_DELTA | undefined) => void;
  onError: (error: unknown) => void;
}): AsyncIterable<string> {
  let accumulatedText = "";
  let lastFullDelta: FULL_DELTA | undefined;

  for await (const event of deltaIterable) {
    if (event?.type === "error") {
      onError(event.error);
      throw event.error;
    }

    if (event?.type === "delta") {
      lastFullDelta = event.fullDelta;

      const delta = extractDelta(lastFullDelta);

      if (delta != null && delta.length > 0) {
        accumulatedText += delta;
        yield delta;
      }
    }
  }

  onDone(accumulatedText, lastFullDelta);
}
