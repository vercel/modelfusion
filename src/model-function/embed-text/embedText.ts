import { Vector } from "../../run/Vector.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
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
export function embedTexts<
  RESPONSE,
  SETTINGS extends TextEmbeddingModelSettings,
>(
  model: TextEmbeddingModel<RESPONSE, SETTINGS>,
  texts: string[],
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<
  TextEmbeddingModel<RESPONSE, SETTINGS>,
  Vector[],
  RESPONSE[]
> {
  return executeCall({
    model,
    options,
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
      ...metadata,
      functionType: "text-embedding",
      settings,
      texts,
    }),
    getAbortEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "text-embedding",
      settings,
      texts,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      ...metadata,
      functionType: "text-embedding",
      settings,
      error,
      texts,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      ...metadata,
      functionType: "text-embedding",
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
export function embedText<
  RESPONSE,
  SETTINGS extends TextEmbeddingModelSettings,
>(
  model: TextEmbeddingModel<RESPONSE, SETTINGS>,
  text: string,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<
  TextEmbeddingModel<RESPONSE, SETTINGS>,
  Vector,
  RESPONSE
> {
  const texts = [text];

  return executeCall({
    model,
    options,
    generateResponse: (options) => {
      return model.generateEmbeddingResponse(texts, options);
    },
    extractOutputValue: (result) => {
      return model.extractEmbeddings(result)[0];
    },
    getStartEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "text-embedding",
      settings,
      texts,
    }),
    getAbortEvent: (metadata, settings) => ({
      ...metadata,
      functionType: "text-embedding",
      settings,
      texts,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      ...metadata,
      functionType: "text-embedding",
      settings,
      error,
      texts,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      ...metadata,
      functionType: "text-embedding",
      settings,
      texts,
      response,
      generatedEmbeddings: [output],
    }),
  });
}
