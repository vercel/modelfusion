import { number, z } from "zod";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedStabilityCallResponseHandler } from "../internal/failedStabilityCallResponseHandler.js";

export const stabilityImageResponseSchema = z.object({
  artifacts: z.array(
    z.object({
      base64: z.string(),
      seed: number(),
      finishReason: z.enum(["SUCCESS", "ERROR", "CONTENT_FILTERED"]),
    })
  ),
});

export type StabilityImageResponse = z.infer<
  typeof stabilityImageResponseSchema
>;

/**
 * Call the Stability AI API for image generation.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 */
export async function generateStabilityImage({
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
  textPrompts: Array<{
    text: string;
    weight?: number;
  }>;
  cfgScale?: number;
  clipGuidancePreset?: string;
  sampler?:
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
  samples?: number;
  seed?: number;
  steps?: number;
  stylePreset?:
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
}): Promise<StabilityImageResponse> {
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
      stabilityImageResponseSchema
    ),
    abortSignal,
  });
}
