import {
  createJsonResponseHandler,
  postJsonToOpenAI,
} from "../postToOpenAI.js";
import { OpenAIEmbedding, openAIEmbeddingSchema } from "./OpenAIEmbedding.js";
import { OpenAIEmbeddingModelType } from "./OpenAIEmbeddingModel.js";

/**
 * Call the OpenAI Embedding API to generate an embedding for the given input.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const response = await generateOpenAIEmbedding({
 *   apiKey: OPENAI_API_KEY,
 *   model: "text-embedding-ada-002",
 *   input: "At first, Nox didn't know what to do with the pup.",
 * });
 *
 * console.log(response.data[0].embedding);
 */
export async function generateOpenAIEmbedding({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  model,
  input,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: OpenAIEmbeddingModelType;
  input: string;
  user?: string;
}): Promise<OpenAIEmbedding> {
  return postJsonToOpenAI({
    url: `${baseUrl}/embeddings`,
    apiKey,
    body: {
      model,
      input,
      user,
    },
    successfulResponseHandler: createJsonResponseHandler(openAIEmbeddingSchema),
    abortSignal,
  });
}
