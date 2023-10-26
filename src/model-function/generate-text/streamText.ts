import { FunctionOptions } from "../../core/FunctionOptions.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { executeStreamCall } from "../executeStreamCall.js";
import { TextStreamingModel } from "./TextGenerationModel.js";

/**
 * Stream the generated text for a prompt as an async iterable.
 *
 * The prompt depends on the model used.
 * For instance, OpenAI completion models expect a string prompt,
 * whereas OpenAI chat models expect an array of chat messages.
 *
 * @see https://modelfusion.dev/guide/function/generate-text
 *
 * @example
 * const textStream = await streamText(
 *   new OpenAICompletionModel(...),
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 *
 * for await (const textPart of textStream) {
 *   // ...
 * }
 *
 * @param {TextStreamingModel<PROMPT>} model - The model to stream text from.
 * @param {PROMPT} prompt - The prompt to use for text generation.
 * @param {FunctionOptions} [options] - Optional parameters for the function.
 *
 * @returns {AsyncIterableResultPromise<string>} An async iterable promise that yields the generated text.
 */
export function streamText<PROMPT>(
  model: TextStreamingModel<PROMPT>,
  prompt: PROMPT,
  options?: FunctionOptions
): AsyncIterableResultPromise<string> {
  let accumulatedText = "";
  let lastFullDelta: unknown | undefined;

  return new AsyncIterableResultPromise<string>(
    executeStreamCall({
      functionType: "stream-text",
      input: prompt,
      model,
      options,
      startStream: async (options) => model.doStreamText(prompt, options),
      processDelta: (delta) => {
        lastFullDelta = delta.fullDelta;

        const textDelta = delta.valueDelta;

        if (textDelta != null && textDelta.length > 0) {
          accumulatedText += textDelta;
          return textDelta;
        }

        return undefined;
      },
      getResult: () => ({
        response: lastFullDelta,
        value: accumulatedText,
      }),
    })
  );
}
