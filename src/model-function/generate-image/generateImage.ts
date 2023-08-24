import { FunctionOptions } from "../FunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";

/**
 * Generates a base64-encoded image using a prompt.
 * The prompt format depends on the model.
 * For example, OpenAI image models expect a string prompt,
 * and Stability AI models expect an array of text prompts with optional weights.
 *
 * @example
 * const image = await generateImage(
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
  SETTINGS extends ImageGenerationModelSettings,
>(
  model: ImageGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  prompt: PROMPT,
  options?: FunctionOptions<SETTINGS>
): ModelFunctionPromise<
  ImageGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  string,
  RESPONSE
> {
  return executeCall({
    model,
    options,
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
