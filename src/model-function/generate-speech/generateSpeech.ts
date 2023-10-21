import { FunctionOptions } from "../../core/FunctionOptions.js";
import { AsyncQueue } from "../../event-source/AsyncQueue.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { executeStreamCall } from "../executeStreamCall.js";
import {
  DuplexSpeechGenerationModel,
  SpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "./SpeechGenerationModel.js";

/**
 * Synthesizes speech from text.
 */
export function generateSpeech(
  model: SpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string,
  options?: FunctionOptions & {
    mode?: "standard";
  }
): ModelFunctionPromise<Buffer>;
export function generateSpeech(
  model: DuplexSpeechGenerationModel<SpeechGenerationModelSettings>,
  text: AsyncIterable<string> | string,
  options: FunctionOptions & {
    mode: "stream-duplex";
  }
): AsyncIterableResultPromise<Buffer>;
export function generateSpeech(
  model:
    | SpeechGenerationModel<SpeechGenerationModelSettings>
    | DuplexSpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string | AsyncIterable<string>,
  options?: FunctionOptions & {
    mode?: "standard" | "stream-duplex";
  }
): ModelFunctionPromise<Buffer> | AsyncIterableResultPromise<Buffer> {
  const mode = options?.mode ?? "standard";

  switch (mode) {
    case "standard": {
      if (typeof text !== "string") {
        throw new Error(
          `The "standard" mode only supports a string input, but received ${text}`
        );
      }

      return new ModelFunctionPromise(
        executeStandardCall({
          functionType: "generate-speech",
          input: text,
          model,
          options,
          generateResponse: async (options) => {
            const response = await model.doGenerateSpeechStandard(
              text,
              options
            );

            return {
              response,
              extractedValue: response,
            };
          },
        })
      );
    }

    case "stream-duplex": {
      if (
        !("doGenerateSpeechStreamDuplex" in model) ||
        typeof model.doGenerateSpeechStreamDuplex !== "function"
      ) {
        throw new Error(
          `The "stream-duplex" mode is not supported by this model.`
        );
      }

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
          functionType: "generate-speech",
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

    default: {
      const mode_: never = mode;
      throw new Error(`Unsupported mode: ${mode_}`);
    }
  }
}
