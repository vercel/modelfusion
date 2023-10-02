import { Vector } from "../../core/Vector.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
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
export function embedMany<
  VALUE,
  RESPONSE,
  SETTINGS extends EmbeddingModelSettings,
>(
  model: EmbeddingModel<VALUE, RESPONSE, SETTINGS>,
  values: VALUE[],
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<Vector[], RESPONSE[]> {
  return executeCall({
    functionType: "embedding",
    input: values,
    model,
    options,
    generateResponse: (options) => {
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

      return Promise.all(
        valueGroups.map((valueGroup) =>
          model.generateEmbeddingResponse(valueGroup, options)
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
export function embed<VALUE, RESPONSE, SETTINGS extends EmbeddingModelSettings>(
  model: EmbeddingModel<VALUE, RESPONSE, SETTINGS>,
  value: VALUE,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<Vector, RESPONSE[]> {
  return executeCall({
    functionType: "embedding",
    input: value,
    model,
    options,
    generateResponse: async (options) => [
      await model.generateEmbeddingResponse([value], options),
    ],
    extractOutputValue: (result) => model.extractEmbeddings(result[0])[0],
  });
}
