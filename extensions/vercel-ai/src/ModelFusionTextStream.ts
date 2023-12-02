import {
  AIStreamCallbacksAndOptions,
  createCallbacksTransformer,
  createStreamDataTransformer,
  readableFromAsyncIterable,
} from "ai";

export function ModelFusionTextStream(
  stream: AsyncIterable<string>,
  callbacks?: AIStreamCallbacksAndOptions
): ReadableStream {
  return readableFromAsyncIterable(stream)
    .pipeThrough(createCallbacksTransformer(callbacks))
    .pipeThrough(
      createStreamDataTransformer(callbacks?.experimental_streamData)
    );
}
