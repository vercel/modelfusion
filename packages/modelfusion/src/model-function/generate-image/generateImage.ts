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
 *   stability.ImageGenerator(...),
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
    fullResponse?: false;
  }
): Promise<Buffer>;
export async function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options: FunctionOptions & {
    fullResponse: true;
  }
): Promise<{
  image: Buffer;
  imageBase64: string;
  images: Buffer[];
  imagesBase64: string[];
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateImage<PROMPT>(
  model: ImageGenerationModel<PROMPT, ImageGenerationModelSettings>,
  prompt: PROMPT,
  options?: FunctionOptions & {
    fullResponse?: boolean;
  }
): Promise<
  | Buffer
  | string
  | {
      image: Buffer;
      imageBase64: string;
      images: Buffer[];
      imagesBase64: string[];
      response: unknown;
      metadata: ModelCallMetadata;
    }
> {
  const fullResponse = await executeStandardCall({
    functionType: "generate-image",
    input: prompt,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateImages(prompt, options);

      return {
        response: result.response,
        extractedValue: result.base64Images,
      };
    },
  });

  const imagesBase64 = fullResponse.value;
  const images = imagesBase64.map((imageBase64) =>
    Buffer.from(imageBase64, "base64")
  );

  return options?.fullResponse
    ? {
        image: images[0],
        imageBase64: imagesBase64[0],
        images,
        imagesBase64,
        response: fullResponse.response,
        metadata: fullResponse.metadata,
      }
    : images[0];
}
