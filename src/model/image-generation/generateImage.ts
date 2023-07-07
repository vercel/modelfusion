import { PromptTemplate } from "../../run/PromptTemplate.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  ImageGenerationModelSettings,
  ImageGenerationModel,
} from "./ImageGenerationModel.js";

/**
 * Generates a base64-encoded image using a prompt.
 * The prompt format depends on the model.
 * For example, OpenAI image models expect a string prompt, and Stability AI models expect an array of text prompts with optional weights.
 *
 * @example
 * const imageBase64 = await generateImage(
 *   new StabilityImageGenerationModel(...),
 *   [
 *     { text: "the wicked witch of the west" },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ]
 * );
 */
export function generateImage<
  PROMPT,
  RESPONSE,
  SETTINGS extends ImageGenerationModelSettings
>(
  model: ImageGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  prompt: PROMPT,
  options?: FunctionOptions<SETTINGS>
): Promise<string> {
  return executeCall({
    model,
    options,
    callModel: (model, options) => generateImage(model, prompt, options),
    generateResponse: (options) => model.generateImageResponse(prompt, options),
    extractOutputValue: model.extractBase64Image,
    getStartEvent: (metadata, settings) => ({
      type: "image-generation-started",
      metadata,
      settings,
      prompt,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "image-generation-finished",
      status: "abort",
      metadata,
      settings,
      prompt,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "image-generation-finished",
      status: "failure",
      metadata,
      settings,
      prompt,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "image-generation-finished",
      status: "success",
      metadata,
      settings,
      prompt,
      response,
      generatedImage: output,
    }),
  });
}

/**
 * Uses a prompt template to create a function that generates an image.
 * The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
 * The input signature of the prompt templates becomes the call signature of the generated function.
 *
 * @example
 * const generatePainting = generateImageAsFunction(
 *   new StabilityImageGenerationModel(...),
 *   async (description: string) => [
 *     { text: description },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ]
 * );
 *
 * const imageBase64 = await generatePainting("the wicked witch of the west");
 */
export function generateImageAsFunction<
  INPUT,
  PROMPT,
  RESPONSE,
  SETTINGS extends ImageGenerationModelSettings
>(
  model: ImageGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  promptTemplate: PromptTemplate<INPUT, PROMPT>,
  generateOptions?: Omit<FunctionOptions<SETTINGS>, "run">
) {
  return async (input: INPUT, options?: FunctionOptions<SETTINGS>) => {
    const expandedPrompt = await promptTemplate(input);
    return generateImage(model, expandedPrompt, {
      functionId: options?.functionId ?? generateOptions?.functionId,
      settings: Object.assign({}, generateOptions?.settings, options?.settings),
      run: options?.run,
    });
  };
}
