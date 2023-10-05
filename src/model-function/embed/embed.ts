import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Vector } from "../../core/Vector.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import { EmbeddingModel, EmbeddingModelSettings } from "./EmbeddingModel.js";

/**
 * Generate embeddings for multiple values.
 *
 * @example
 * const embeddings = await embedMany(
 *   new OpenAITextEmbeddingModel(...),
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 */
export function embedMany<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  values: VALUE[],
  options?: FunctionOptions
): ModelFunctionPromise<Vector[]> {
  return executeCall({
    functionType: "embedding",
    input: values,
    model,
    options,
    generateResponse: async (options) => {
      // split the values into groups that are small enough to be sent in one call:
      const maxValuesPerCall = model.maxValuesPerCall;
      const valueGroups: VALUE[][] = [];

      if (maxValuesPerCall == null) {
        valueGroups.push(values);
      } else {
        for (let i = 0; i < values.length; i += maxValuesPerCall) {
          valueGroups.push(values.slice(i, i + maxValuesPerCall));
        }
      }

      const responses = await Promise.all(
        valueGroups.map((valueGroup) =>
          model.doEmbedValues(valueGroup, options)
        )
      );

      const rawResponses = responses.map((response) => response.response);
      const embeddings: Array<Vector> = [];
      for (const response of responses) {
        embeddings.push(...response.embeddings);
      }

      return {
        response: rawResponses,
        extractedValue: embeddings,
      };
    },
  });
}

/**
 * Generate an embedding for a single value.
 *
 * @example
 * const embedding = await embed(
 *   new OpenAITextEmbeddingModel(...),
 *   "At first, Nox didn't know what to do with the pup."
 * );
 */
export function embed<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  value: VALUE,
  options?: FunctionOptions
): ModelFunctionPromise<Vector> {
  return executeCall({
    functionType: "embedding",
    input: value,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doEmbedValues([value], options);
      return {
        response: result.response,
        extractedValue: result.embeddings[0],
      };
    },
  });
}
