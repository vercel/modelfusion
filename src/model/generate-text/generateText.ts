import { PromptTemplate } from "../../run/PromptTemplate.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  TextGenerationModelSettings,
  TextGenerationModel,
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
  SETTINGS extends TextGenerationModelSettings
>(
  model: TextGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  prompt: PROMPT,
  options?: FunctionOptions<SETTINGS>
): Promise<string> {
  return executeCall({
    model,
    options,
    callModel: (model, options) => generateText(model, prompt, options),
    generateResponse: (options) => model.generateTextResponse(prompt, options),
    extractOutputValue: (result) => {
      const shouldTrimOutput = model.settings.trimOutput ?? true;
      return shouldTrimOutput
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
}

/**
 * Uses a prompt template to create a function that generates text.
 * The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
 * The input signature of the prompt templates becomes the call signature of the generated function.
 *
 * @example
 * const model = new OpenAITextGenerationModel(...);
 *
 * const generateStoryAbout = model.generateTextAsFunction(
 *   async (character: string) =>
 *     `Write a short story about ${character} learning to love:\n\n`
 * );
 *
 * const story = await generateStoryAbout("a robot");
 */
export function generateTextAsFunction<
  INPUT,
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings
>(
  model: TextGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  promptTemplate: PromptTemplate<INPUT, PROMPT>,
  generateOptions?: Omit<FunctionOptions<SETTINGS>, "run">
) {
  return async (input: INPUT, options?: FunctionOptions<SETTINGS>) => {
    const expandedPrompt = await promptTemplate(input);
    return generateText(model, expandedPrompt, {
      functionId: options?.functionId ?? generateOptions?.functionId,
      settings: Object.assign({}, generateOptions?.settings, options?.settings),
      run: options?.run,
    });
  };
}
