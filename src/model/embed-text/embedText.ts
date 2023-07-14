import { Vector } from "../../run/Vector.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "./TextEmbeddingModel.js";

/**
 * Generate embeddings for multiple texts.
 *
 * @example
 * const embeddings = await embedTexts(
 *   new OpenAITextEmbeddingModel(...),
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 */
export async function embedTexts<
  RESPONSE,
  SETTINGS extends TextEmbeddingModelSettings
>(
  model: TextEmbeddingModel<RESPONSE, SETTINGS>,
  texts: string[],
  options?: FunctionOptions<SETTINGS>
): Promise<Vector[]> {
  return executeCall({
    model,
    options,
    callModel: (model, options) => embedTexts(model, texts, options),
    generateResponse: (options) => {
      // split the texts into groups that are small enough to be sent in one call:
      const maxTextsPerCall = model.maxTextsPerCall;
      const textGroups: string[][] = [];
      for (let i = 0; i < texts.length; i += maxTextsPerCall) {
        textGroups.push(texts.slice(i, i + maxTextsPerCall));
      }

      return Promise.all(
        textGroups.map((textGroup) =>
          model.generateEmbeddingResponse(textGroup, options)
        )
      );
    },
    extractOutputValue: (result) => {
      const embeddings: Array<Vector> = [];
      for (const response of result) {
        embeddings.push(...model.extractEmbeddings(response));
      }
      return embeddings;
    },
    getStartEvent: (metadata, settings) => ({
      type: "text-embedding-started",
      metadata,
      settings,
      texts,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "text-embedding-finished",
      status: "abort",
      metadata,
      settings,
      texts,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "text-embedding-finished",
      status: "failure",
      metadata,
      settings,
      error,
      texts,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "text-embedding-finished",
      status: "success",
      metadata,
      settings,
      texts,
      response,
      generatedEmbeddings: output,
    }),
  });
}

/**
 * Generate an embedding for a single text.
 *
 * @example
 * const embedding = await embedText(
 *   new OpenAITextEmbeddingModel(...),
 *   "At first, Nox didn't know what to do with the pup."
 * );
 */
export async function embedText<
  RESPONSE,
  SETTINGS extends TextEmbeddingModelSettings
>(
  model: TextEmbeddingModel<RESPONSE, SETTINGS>,
  text: string,
  options?: FunctionOptions<SETTINGS>
): Promise<Vector> {
  const embeddings = await embedTexts(model, [text], options);
  return embeddings[0];
}
