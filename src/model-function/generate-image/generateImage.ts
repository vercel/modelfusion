import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";

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
 * @returns {Promise} - Returns a promise that resolves to the generated image.
 * The image is a Buffer containing the image data in PNG format.
 */
export async function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions & {
    returnType?: "buffer";
  }
): Promise<Buffer>;
export async function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options: FunctionOptions & {
    returnType: "base64";
  }
): Promise<string>;
export async function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options: FunctionOptions & {
    returnType: "full";
  }
): Promise<{ value: string; response: unknown; metadata: ModelCallMetadata }>;
export async function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions & {
    returnType?: "base64" | "buffer" | "full";
  }
): Promise<
  | Buffer
  | string
  | { value: string; response: unknown; metadata: ModelCallMetadata }
> {
  const fullResponse = await executeStandardCall({
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
  });

  switch (options?.returnType) {
    case "full":
      return fullResponse;
    case "base64":
      return fullResponse.value;
    case "buffer":
    default:
      return Buffer.from(fullResponse.value, "base64");
  }
}
