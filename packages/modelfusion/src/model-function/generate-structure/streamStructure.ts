import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
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
 * const structureStream = await streamStructure({
 *   structureGenerator: openai.ChatTextGenerator(...).asFunctionCallStructureGenerationModel(...),
 *   schema: zodSchema(
 *     z.array(
 *       z.object({
 *         name: z.string(),
 *         class: z
 *           .string()
 *           .describe("Character class, e.g. warrior, mage, or thief."),
 *         description: z.string(),
 *       })
 *     ),
 *   prompt: [
 *     openai.ChatMessage.user(
 *       "Generate 3 character descriptions for a fantasy role playing game."
 *     ),
 *   ]
 * });
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
 * @param {StructureStreamingModel<PROMPT>} structureGenerator - The model to use for streaming
 * @param {Schema<STRUCTURE>} schema - The schema to be used.
 * @param {PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT)} prompt
 * The prompt to be used.
 * You can also pass a function that takes the schema as an argument and returns the prompt.
 * @param {FunctionOptions} [options] - Optional function options
 *
 * @returns {AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>>}
 * The async iterable result promise.
 * Each part of the stream is either a partial structure or the final structure.
 * It contains a isComplete flag to indicate whether the structure is complete,
 * and a value that is either the partial structure or the final structure.
 */
export async function streamStructure<STRUCTURE, PROMPT>(
  args: {
    model: StructureStreamingModel<PROMPT>;
    schema: Schema<STRUCTURE> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
    fullResponse?: false;
  } & FunctionOptions
): Promise<AsyncIterable<StructureStreamPart<STRUCTURE>>>;
export async function streamStructure<STRUCTURE, PROMPT>(
  args: {
    model: StructureStreamingModel<PROMPT>;
    schema: Schema<STRUCTURE> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  structureStream: AsyncIterable<StructureStreamPart<STRUCTURE>>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}>;
export async function streamStructure<STRUCTURE, PROMPT>({
  model,
  schema,
  prompt,
  fullResponse,
  ...options
}: {
  model: StructureStreamingModel<PROMPT>;
  schema: Schema<STRUCTURE> & JsonSchemaProducer;
  prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | AsyncIterable<StructureStreamPart<STRUCTURE>>
  | {
      structureStream: AsyncIterable<StructureStreamPart<STRUCTURE>>;
      metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (schema: Schema<STRUCTURE>) => PROMPT)(schema)
      : prompt;

  let accumulatedText = "";
  let lastStructure: unknown | undefined;

  const callResponse = await executeStreamCall<
    unknown,
    StructureStreamPart<STRUCTURE>,
    StructureStreamingModel<PROMPT>
  >({
    functionType: "stream-structure",
    input: {
      schema,
      prompt: expandedPrompt,
    },
    model,
    options,
    startStream: async (options) =>
      model.doStreamStructure(schema, expandedPrompt, options),
    processDelta: (delta) => {
      const textDelta = model.extractStructureTextDelta(delta.deltaValue);

      if (textDelta == null) {
        return undefined;
      }

      accumulatedText += textDelta;

      const latestStructure =
        model.parseAccumulatedStructureText(accumulatedText);

      // only send a new part into the stream when the partial structure has changed:
      if (!isDeepEqualData(lastStructure, latestStructure)) {
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
      const parseResult = schema.validate(lastStructure);

      if (!parseResult.success) {
        reportError(parseResult.error);
        throw parseResult.error;
      }

      return {
        isComplete: true,
        value: parseResult.data,
      };
    },
  });

  return fullResponse
    ? {
        structureStream: callResponse.value,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
