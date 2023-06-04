import { number, z } from "zod";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedStabilityCallResponseHandler } from "../internal/failedStabilityCallResponseHandler.js";

export const stabilityImageGenerationResponseSchema = z.object({
  artifacts: z.array(
    z.object({
      base64: z.string(),
      seed: number(),
      finishReason: z.enum(["SUCCESS", "ERROR", "CONTENT_FILTERED"]),
    })
  ),
});

export type StabilityImageGenerationResponse = z.infer<
  typeof stabilityImageGenerationResponseSchema
>;

export type StabilityImageGenerationStylePreset =
  | "enhance"
  | "anime"
  | "photographic"
  | "digital-art"
  | "comic-book"
  | "fantasy-art"
  | "line-art"
  | "analog-film"
  | "neon-punk"
  | "isometric"
  | "low-poly"
  | "origami"
  | "modeling-compound"
  | "cinematic"
  | "3d-model"
  | "pixel-art"
  | "tile-texture";

export type StabilityImageGenerationSampler =
  | "DDIM"
  | "DDPM"
  | "K_DPMPP_2M"
  | "K_DPMPP_2S_ANCESTRAL"
  | "K_DPM_2"
  | "K_DPM_2_ANCESTRAL"
  | "K_EULER"
  | "K_EULER_ANCESTRAL"
  | "K_HEUN"
  | "K_LMS";

export type StabilityImageGenerationPrompt = Array<{
  text: string;
  weight?: number;
}>;

/**
 * Call the Stability AI API for image generation.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 *
 * @example
 * const imageResponse = await callStabilityImageGenerationAPI({
 *   apiKey: STABILITY_API_KEY,
 *   engineId: "stable-diffusion-512-v2-1",
 *   textPrompts: [
 *     { text: "the wicked witch of the west" },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ],
 *   cfgScale: 7,
 *   clipGuidancePreset: "FAST_BLUE",
 *   height: 512,
 *   width: 512,
 *   samples: 1,
 *   steps: 30,
 * });
 *
 * imageResponse.artifacts.forEach((image, index) => {
 *   fs.writeFileSync(
 *     `./stability-image-example-${index}.png`,
 *     Buffer.from(image.base64, "base64")
 *   );
 * });
 */
export async function callStabilityImageGenerationAPI({
  baseUrl = "https://api.stability.ai/v1",
  abortSignal,
  apiKey,
  engineId,
  height,
  width,
  textPrompts,
  cfgScale,
  clipGuidancePreset,
  sampler,
  samples,
  seed,
  steps,
  stylePreset,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  engineId: string;
  height?: number;
  width?: number;
  textPrompts: StabilityImageGenerationPrompt;
  cfgScale?: number;
  clipGuidancePreset?: string;
  sampler?: StabilityImageGenerationSampler;
  samples?: number;
  seed?: number;
  steps?: number;
  stylePreset?: StabilityImageGenerationStylePreset;
}): Promise<StabilityImageGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/generation/${engineId}/text-to-image`,
    apiKey,
    body: {
      height,
      width,
      text_prompts: textPrompts,
      cfg_scale: cfgScale,
      clip_guidance_preset: clipGuidancePreset,
      sampler,
      samples,
      seed,
      steps,
      style_preset: stylePreset,
    },
    failedResponseHandler: failedStabilityCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      stabilityImageGenerationResponseSchema
    ),
    abortSignal,
  });
}
