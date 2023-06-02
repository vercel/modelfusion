import { z } from "zod";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedOpenAICallResponseHandler } from "../internal/failedOpenAICallResponseHandler.js";

export type OpenAIImageGenerationResponseFormat<T> = {
  type: "b64_json" | "url";
  handler: ResponseHandler<T>;
};

/**
 * Call the OpenAI Image Creation API to generate an image for the given prompt.
 *
 * @see https://platform.openai.com/docs/api-reference/images/create
 *
 * @example
 * const imageResponse = await generateOpenAIImage({
 *   apiKey: OPENAI_API_KEY,
 *   prompt:
 *     "the wicked witch of the west in the style of early 19th century painting",
 *   size: "512x512",
 *   responseFormat: generateOpenAIImage.responseFormat.base64Json,
 * });
 */
export async function generateOpenAIImage<RESPONSE>({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  prompt,
  n,
  size,
  responseFormat,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  prompt: string;
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
  responseFormat: OpenAIImageGenerationResponseFormat<RESPONSE>;
  user?: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: `${baseUrl}/images/generations`,
    apiKey,
    body: {
      prompt,
      n,
      size,
      response_format: responseFormat.type,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat?.handler,
    abortSignal,
  });
}

export const openAIImageGenerationUrlSchema = z.object({
  created: z.number(),
  data: z.array(
    z.object({
      url: z.string(),
    })
  ),
});

export type OpenAIImageGenerationUrlResponse = z.infer<
  typeof openAIImageGenerationUrlSchema
>;

export const openAIImageGenerationBase64JsonSchema = z.object({
  created: z.number(),
  data: z.array(
    z.object({
      b64_json: z.string(),
    })
  ),
});

export type OpenAIImageGenerationBase64JsonResponse = z.infer<
  typeof openAIImageGenerationBase64JsonSchema
>;

generateOpenAIImage.responseFormat = {
  url: {
    type: "url" as const,
    handler: createJsonResponseHandler(openAIImageGenerationUrlSchema),
  },
  base64Json: {
    type: "b64_json" as const,
    handler: createJsonResponseHandler(openAIImageGenerationBase64JsonSchema),
  },
};
