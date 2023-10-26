import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";
import { ImageGenerationPromise } from "./ImageGenerationPromise.js";

/**
 * Generates an image using a prompt.
 *
 * The prompt depends on the model. For example, OpenAI image models expect a string prompt,
 * and Stability AI models expect an array of text prompts with optional weights.
 *
 * @see https://modelfusion.dev/guide/function/generate-image
 *
 * @example
 * const image = await generateImage(
 *   new StabilityImageGenerationModel(...),
 *   [
 *     { text: "the wicked witch of the west" },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ]
 * );
 *
 * @param {ImageGenerationModel<PROMPT, ImageGenerationModelSettings>} model - The image generation model to be used.
 * @param {PROMPT} prompt - The prompt to be used for image generation.
 * @param {FunctionOptions} [options] - Optional settings for the function.
 *
 * @returns {ImageGenerationPromise} - Returns a promise that resolves to the generated image.
 * The image is a Buffer containing the image data in PNG format.
 */
export function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions
): ImageGenerationPromise {
  return new ImageGenerationPromise(
    executeStandardCall({
      functionType: "generate-image",
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
