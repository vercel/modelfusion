import { BaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { StabilityApiConfiguration } from "./StabilityApiConfiguration.js";
import {
  StabilityImageGenerationModel,
  StabilityImageGenerationSettings,
} from "./StabilityImageGenerationModel.js";

/**
 * Creates an API configuration for the Stability AI API.
 * It calls the API at https://api.stability.ai/v1 by default and uses the `STABILITY_API_KEY` environment variable.
 */
export function Api(
  settings: Partial<BaseUrlPartsApiConfigurationOptions> & {
    apiKey?: string;
  }
) {
  return new StabilityApiConfiguration(settings);
}

/**
 * Create an image generation model that calls the Stability AI image generation API.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 *
 * @example
 * const image = await generateImage(
 *   stability.ImageGenerator({
 *     model: "stable-diffusion-v1-6",
 *     cfgScale: 7,
 *     clipGuidancePreset: "FAST_BLUE",
 *     height: 512,
 *     width: 512,
 *     steps: 30,
 *   })
 *   [
 *     { text: "the wicked witch of the west" },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ]
 * );
 *
 * @returns A new instance of {@link StabilityImageGenerationModel}.
 */
export function ImageGenerator(settings: StabilityImageGenerationSettings) {
  return new StabilityImageGenerationModel(settings);
}
