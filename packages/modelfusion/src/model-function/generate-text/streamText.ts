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
 * const textStream = await streamText({
 *   model: openai.CompletionTextGenerator(...),
 *   prompt: "Write a short story about a robot learning to love:\n\n"
 * });
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
  args: {
    model: TextStreamingModel<PROMPT>;
    prompt: PROMPT;
    fullResponse?: false;
  } & FunctionOptions
): Promise<AsyncIterable<string>>;
export async function streamText<PROMPT>(
  args: {
    model: TextStreamingModel<PROMPT>;
    prompt: PROMPT;
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  textStream: AsyncIterable<string>;
  text: PromiseLike<string>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}>;
export async function streamText<PROMPT>({
  model,
  prompt,
  fullResponse,
  ...options
}: {
  model: TextStreamingModel<PROMPT>;
  prompt: PROMPT;
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | AsyncIterable<string>
  | {
      textStream: AsyncIterable<string>;
      text: PromiseLike<string>;
      metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
    }
> {
  const shouldTrimWhitespace = model.settings.trimWhitespace ?? true;

  let accumulatedText = "";
  let isFirstDelta = true;
  let trailingWhitespace = "";

  let resolveText: (value: string) => void;
  const textPromise = new Promise<string>((resolve) => {
    resolveText = resolve;
  });

  const callResponse = await executeStreamCall({
    functionType: "stream-text",
    input: prompt,
    model,
    options,
    startStream: async (options) => model.doStreamText(prompt, options),
    processDelta: (delta) => {
      let textDelta = model.extractTextDelta(delta.deltaValue);

      if (textDelta == null || textDelta.length === 0) {
        return undefined;
      }

      if (shouldTrimWhitespace) {
        textDelta = isFirstDelta
          ? // remove leading whitespace:
            textDelta.trimStart()
          : // restore trailing whitespace from previous chunk:
            trailingWhitespace + textDelta;

        // trim trailing whitespace and store it for the next chunk:
        const trailingWhitespaceMatch = textDelta.match(/\s+$/);
        trailingWhitespace = trailingWhitespaceMatch
          ? trailingWhitespaceMatch[0]
          : "";
        textDelta = textDelta.trimEnd();
      }

      isFirstDelta = false;
      accumulatedText += textDelta;

      return textDelta;
    },
    onDone: () => {
      resolveText(accumulatedText);
    },
  });

  return fullResponse
    ? {
        textStream: callResponse.value,
        text: textPromise,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
