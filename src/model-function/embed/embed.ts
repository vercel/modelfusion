import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Vector } from "../../core/Vector.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { EmbeddingModel, EmbeddingModelSettings } from "./EmbeddingModel.js";

/**
 * Generate embeddings for multiple values.
 *
 * @see https://modelfusion.dev/guide/function/embed
 *
 * @example
 * const embeddings = await embedMany(
 *   new OpenAITextEmbeddingModel(...),
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 *
 * @param {EmbeddingModel<VALUE, EmbeddingModelSettings>} model - The model to use for generating embeddings.
 * @param {VALUE[]} values - The values to generate embeddings for.
 * @param {FunctionOptions} [options] - Optional settings for the function.
 *
 * @returns {Promise<Vector[]>} - A promise that resolves to an array of vectors representing the embeddings.
 */
export async function embedMany<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  values: VALUE[],
  options?: FunctionOptions & { returnType?: "vectors" }
): Promise<Vector[]>;
export async function embedMany<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  values: VALUE[],
  options: FunctionOptions & { returnType: "full" }
): Promise<{
  value: Vector[];
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function embedMany<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  values: VALUE[],
  options?: FunctionOptions & { returnType?: "vectors" | "full" }
): Promise<
  | Vector[]
  | {
      value: Vector[];
      response: unknown;
      metadata: ModelCallMetadata;
    }
> {
  const fullResponse = await executeStandardCall({
    functionType: "embed",
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

      // call the model for each group:
      let responses: Array<{ response: unknown; embeddings: Vector[] }>;
      if (model.isParallizable) {
        responses = await Promise.all(
          valueGroups.map((valueGroup) =>
            model.doEmbedValues(valueGroup, options)
          )
        );
      } else {
        responses = [];
        for (const valueGroup of valueGroups) {
          const response = await model.doEmbedValues(valueGroup, options);
          responses.push(response);
        }
      }

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

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}

/**
 * Generate an embedding for a single value.
 *
 * @see https://modelfusion.dev/guide/function/embed
 *
 * @example
 * const embedding = await embed(
 *   new OpenAITextEmbeddingModel(...),
 *   "At first, Nox didn't know what to do with the pup."
 * );
 *
 * @param {EmbeddingModel<VALUE, EmbeddingModelSettings>} model - The model to use for generating the embedding.
 * @param {VALUE} value - The value to generate an embedding for.
 * @param {FunctionOptions} [options] - Optional settings for the function.
 *
 * @returns {Promise<Vector>} - A promise that resolves to a vector representing the embedding.
 */
export async function embed<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  value: VALUE,
  options?: FunctionOptions & { returnType?: "vector" }
): Promise<Vector>;
export async function embed<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  value: VALUE,
  options: FunctionOptions & { returnType: "full" }
): Promise<{ value: Vector; response: unknown; metadata: ModelCallMetadata }>;
export async function embed<VALUE>(
  model: EmbeddingModel<VALUE, EmbeddingModelSettings>,
  value: VALUE,
  options?: FunctionOptions & { returnType?: "vector" | "full" }
): Promise<
  Vector | { value: Vector; response: unknown; metadata: ModelCallMetadata }
> {
  const fullResponse = await executeStandardCall({
    functionType: "embed",
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

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
