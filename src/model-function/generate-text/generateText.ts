import { FunctionOptions } from "../FunctionOptions.js";
import { CallMetadata, executeCall } from "../executeCall.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";

/**
 * Generates a text using a prompt.
 * The prompt format depends on the model.
 * For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
 *
 * @example
 * const model = new OpenAITextGenerationModel(...);
 *
 * const text = await model.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export async function generateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: TextGenerationModel<PROMPT, RESPONSE, any, SETTINGS>,
  prompt: PROMPT,
  options: FunctionOptions<SETTINGS> & {
    fullResponse: true;
  }
): Promise<{
  text: string;
  response: RESPONSE;
  metadata: CallMetadata<
    TextGenerationModel<PROMPT, RESPONSE, unknown, SETTINGS>
  >;
}>;
export async function generateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: TextGenerationModel<PROMPT, RESPONSE, any, SETTINGS>,
  prompt: PROMPT,
  options?: FunctionOptions<SETTINGS> & {
    fullResponse?: false;
  }
): Promise<string>;
export async function generateText<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: TextGenerationModel<PROMPT, RESPONSE, any, SETTINGS>,
  prompt: PROMPT,
  options?: FunctionOptions<SETTINGS> & {
    fullResponse?: boolean;
  }
) {
  const result = await executeCall({
    model,
    options,
    generateResponse: (options) => model.generateTextResponse(prompt, options),
    extractOutputValue: (result) => {
      const shouldTrimWhitespace = model.settings.trimWhitespace ?? true;
      return shouldTrimWhitespace
        ? model.extractText(result).trim()
        : model.extractText(result);
    },
    getStartEvent: (metadata, settings) => ({
      type: "text-generation-started",
      metadata,
      settings,
      prompt,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "text-generation-finished",
      status: "abort",
      metadata,
      settings,
      prompt,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "text-generation-finished",
      status: "failure",
      metadata,
      settings,
      prompt,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "text-generation-finished",
      status: "success",
      metadata,
      settings,
      prompt,
      response,
      generatedText: output,
    }),
  });

  return options?.fullResponse === true
    ? {
        text: result.output,
        response: result.response,
        metadata: result.metadata,
      }
    : result.output;
}
