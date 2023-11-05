import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
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
export async function streamText<PROMPT>(
  model: TextStreamingModel<PROMPT>,
  prompt: PROMPT,
  options?: FunctionOptions & { returnType?: "text-stream" }
): Promise<AsyncIterable<string>>;
export async function streamText<PROMPT>(
  model: TextStreamingModel<PROMPT>,
  prompt: PROMPT,
  options: FunctionOptions & { returnType: "full" }
): Promise<{
  value: AsyncIterable<string>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}>;
export async function streamText<PROMPT>(
  model: TextStreamingModel<PROMPT>,
  prompt: PROMPT,
  options?: FunctionOptions & { returnType?: "text-stream" | "full" }
): Promise<
  | AsyncIterable<string>
  | {
      value: AsyncIterable<string>;
      metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
    }
> {
  let accumulatedText = "";
  let lastFullDelta: unknown | undefined;

  const fullResponse = await executeStreamCall({
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
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
