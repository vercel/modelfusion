import {
  Automatic1111ImageGenerationModel,
  Automatic1111ImageGenerationSettings,
} from "./Automatic1111ImageGenerationModel.js";

/**
 * Create an image generation model that calls the AUTOMATIC1111 Stable Diffusion Web UI API.
 *
 * @see https://github.com/AUTOMATIC1111/stable-diffusion-webui
 *
 * @return A new instance of ${@link Automatic1111ImageGenerationModel}.
 */
export function ImageGenerator(settings: Automatic1111ImageGenerationSettings) {
  return new Automatic1111ImageGenerationModel(settings);
}
