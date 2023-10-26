import { FunctionOptions } from "../../core/FunctionOptions.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { executeStreamCall } from "../executeStreamCall.js";
import {
  StreamingSpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "./SpeechGenerationModel.js";

/**
 * Stream synthesized speech from text. Also called text-to-speech (TTS).
 * Duplex streaming where both the input and output are streamed is supported.
 *
 * @see https://modelfusion.dev/guide/function/generate-speech
 *
 * @example
 * const textStream = await streamText(...);
 *
 * const speechStream = await streamSpeech(
 *   new ElevenLabsSpeechModel(...),
 *   textStream
 * );
 *
 * for await (const speechPart of speechStream) {
 *   // ...
 * }
 *
 * @param {StreamingSpeechGenerationModel<SpeechGenerationModelSettings>} model - The speech generation model.
 * @param {AsyncIterable<string> | string} text - The text to be converted to speech. Can be a string or an async iterable of strings.
 * @param {FunctionOptions} [options] - Optional function options.
 *
 * @returns {AsyncIterableResultPromise<Buffer>} An async iterable promise that contains the synthesized speech chunks.
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
      functionType: "stream-speech",
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
