import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { isDeepEqualData } from "../../util/isDeepEqualData.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStreamCall } from "../executeStreamCall.js";
import { StructureStreamingModel } from "./StructureGenerationModel.js";

export type StructureStreamPart<STRUCTURE> =
  | { isComplete: false; value: unknown }
  | { isComplete: true; value: STRUCTURE };

/**
 * Generate and stream an object for a prompt and a structure definition.
 *
 * The final object is typed according to the structure definition.
 * The partial objects are of unknown type,
 * but are supposed to be partial version of the final object
 * (unless the underlying model returns invalid data).
 *
 * The structure definition is used as part of the final prompt.
 *
 * For the OpenAI chat model, this generates and parses a function call with a single function.
 *
 * @see https://modelfusion.dev/guide/function/generate-structure
 *
 * @example
 * const structureStream = await streamStructure(
 *    new OpenAIChatModel({
 *      model: "gpt-3.5-turbo",
 *     temperature: 0,
 *     maxCompletionTokens: 2000,
 *   }),
 *   new ZodStructureDefinition({
 *     name: "generateCharacter",
 *     description: "Generate character descriptions.",
 *     schema: z.object({
 *       characters: z.array(
 *         z.object({
 *           name: z.string(),
 *           class: z
 *             .string()
 *             .describe("Character class, e.g. warrior, mage, or thief."),
 *           description: z.string(),
 *         })
 *       ),
 *     }),
 *   }),
 *   [
 *     OpenAIChatMessage.user(
 *       "Generate 3 character descriptions for a fantasy role playing game."
 *     ),
 *   ]
 * );
 *
 * for await (const part of structureStream) {
 *   if (!part.isComplete) {
 *     const unknownPartialStructure = part.value;
 *     // use your own logic to handle partial structures, e.g. with Zod .deepPartial()
 *     // it depends on your application at which points you want to act on the partial structures
 *   } else {
 *     const fullyTypedStructure = part.value;
 *     // ...
 *   }
 * }
 *
 * @param {StructureStreamingModel<PROMPT>} model - The model to use for streaming
 * @param {StructureDefinition<NAME, STRUCTURE>} structureDefinition - The structure definition to use
 * @param {PROMPT | ((structureDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT)} prompt
 * The prompt to be used.
 * You can also pass a function that takes the structure definition as an argument and returns the prompt.
 * @param {FunctionOptions} [options] - Optional function options
 *
 * @returns {AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>>}
 * The async iterable result promise.
 * Each part of the stream is either a partial structure or the final structure.
 * It contains a isComplete flag to indicate whether the structure is complete,
 * and a value that is either the partial structure or the final structure.
 */
export async function streamStructure<STRUCTURE, PROMPT, NAME extends string>(
  model: StructureStreamingModel<PROMPT>,
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt:
    | PROMPT
    | ((structureDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure-stream" }
): Promise<AsyncIterable<StructureStreamPart<STRUCTURE>>>;
export async function streamStructure<STRUCTURE, PROMPT, NAME extends string>(
  model: StructureStreamingModel<PROMPT>,
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt:
    | PROMPT
    | ((structureDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT),
  options: FunctionOptions & { returnType: "full" }
): Promise<{
  value: AsyncIterable<StructureStreamPart<STRUCTURE>>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}>;
export async function streamStructure<STRUCTURE, PROMPT, NAME extends string>(
  model: StructureStreamingModel<PROMPT>,
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt:
    | PROMPT
    | ((structureDefinition: StructureDefinition<NAME, STRUCTURE>) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure-stream" | "full" }
): Promise<
  | AsyncIterable<StructureStreamPart<STRUCTURE>>
  | {
      value: AsyncIterable<StructureStreamPart<STRUCTURE>>;
      metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (
          prompt as (
            structureDefinition: StructureDefinition<NAME, STRUCTURE>
          ) => PROMPT
        )(structureDefinition)
      : prompt;

  let lastStructure: unknown | undefined;
  let lastFullDelta: unknown | undefined;

  const fullResponse = await executeStreamCall<
    unknown,
    StructureStreamPart<STRUCTURE>,
    StructureStreamingModel<PROMPT>
  >({
    functionType: "stream-structure",
    input: prompt,
    model,
    options,
    startStream: async (options) =>
      model.doStreamStructure(structureDefinition, expandedPrompt, options),
    processDelta: (delta) => {
      const latestFullDelta = delta.fullDelta;
      const latestStructure = delta.valueDelta;

      // only send a new part into the stream when the partial structure has changed:
      if (!isDeepEqualData(lastStructure, latestStructure)) {
        lastFullDelta = latestFullDelta;
        lastStructure = latestStructure;

        return {
          isComplete: false,
          value: lastStructure,
        } satisfies StructureStreamPart<STRUCTURE>;
      }

      return undefined;
    },
    processFinished: () => {
      // process the final result (full type validation):
      const parseResult = structureDefinition.schema.validate(lastStructure);

      if (!parseResult.success) {
        reportError(parseResult.error);
        throw parseResult.error;
      }

      return {
        isComplete: true,
        value: parseResult.data,
      };
    },
    getResult: () => ({
      response: lastFullDelta,
      value: lastStructure,
    }),
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
