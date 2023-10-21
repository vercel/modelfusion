import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";
import { ImageGenerationPromise } from "./ImageGenerationPromise.js";

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
export function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions
): ImageGenerationPromise {
  return new ImageGenerationPromise(
    executeStandardCall({
      functionType: "image-generation",
      input: prompt,
      model,
      options,
      generateResponse: async (options) => {
        const result = await model.doGenerateImage(prompt, options);
        return {
          response: result.response,
          extractedValue: result.base64Image,
        };
      },
    })
  );
}
