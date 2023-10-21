import { FunctionOptions } from "../../core/FunctionOptions.js";
import { AsyncQueue } from "../../event-source/AsyncQueue.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { executeStreamCall } from "../executeStreamCall.js";
import {
  StreamingSpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "./SpeechGenerationModel.js";

/**
 * Synthesizes speech from text.
 */

export function streamSpeech(
  model: StreamingSpeechGenerationModel<SpeechGenerationModelSettings>,
  text: AsyncIterable<string> | string,
  options?: FunctionOptions
): AsyncIterableResultPromise<Buffer> {
  let textStream: AsyncIterable<string>;

  // simulate a stream with a single value for a string input:
  if (typeof text === "string") {
    const queue = new AsyncQueue<string>();
    queue.push(text);
    queue.close();
    textStream = queue;
  } else {
    textStream = text;
  }

  return new AsyncIterableResultPromise<Buffer>(
    executeStreamCall({
      functionType: "speech-streaming",
      input: text,
      model,
      options,
      startStream: async (options) =>
        model.doGenerateSpeechStreamDuplex(textStream, options),
      processDelta: (delta) => {
        return delta.valueDelta;
      },
      getResult: () => ({}),
    })
  );
}
