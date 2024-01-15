import type { PartialDeep } from "type-fest";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { isDeepEqualData } from "../../util/isDeepEqualData.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStreamCall } from "../executeStreamCall.js";
import { StructureStreamingModel } from "./StructureGenerationModel.js";

/**
 * Generate and stream an object for a prompt and a structure definition.
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
 * for await (const partialStructure of structureStream) {
 *   // ...
 * }
 *
 * @param {StructureStreamingModel<PROMPT>} structureGenerator - The model to use for streaming
 * @param {Schema<STRUCTURE>} schema - The schema to be used.
 * @param {PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT)} prompt
 * The prompt to be used.
 * You can also pass a function that takes the schema as an argument and returns the prompt.
 *
 * @returns {AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>>}
 * The async iterable result promise.
 * Each part of the stream is a partial structure.
 */
export async function streamStructure<STRUCTURE, PROMPT>(
  args: {
    model: StructureStreamingModel<PROMPT>;
    schema: Schema<STRUCTURE> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
    fullResponse?: false;
  } & FunctionOptions
): Promise<AsyncIterable<PartialDeep<STRUCTURE, { recurseIntoArrays: true }>>>;
export async function streamStructure<STRUCTURE, PROMPT>(
  args: {
    model: StructureStreamingModel<PROMPT>;
    schema: Schema<STRUCTURE> & JsonSchemaProducer;
    prompt: PROMPT | ((schema: Schema<STRUCTURE>) => PROMPT);
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  structureStream: AsyncIterable<
    PartialDeep<STRUCTURE, { recurseIntoArrays: true }>
  >;
  structurePromise: PromiseLike<STRUCTURE>;
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
  | AsyncIterable<PartialDeep<STRUCTURE, { recurseIntoArrays: true }>>
  | {
      structureStream: AsyncIterable<
        PartialDeep<STRUCTURE, { recurseIntoArrays: true }>
      >;
      structurePromise: PromiseLike<STRUCTURE>;
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

  let resolveStructure: (value: STRUCTURE) => void;
  let rejectStructure: (reason: unknown) => void;
  const structurePromise = new Promise<STRUCTURE>((resolve, reject) => {
    resolveStructure = resolve;
    rejectStructure = reject;
  });

  const callResponse = await executeStreamCall<
    unknown,
    PartialDeep<STRUCTURE>,
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
        return lastStructure as PartialDeep<
          STRUCTURE,
          { recurseIntoArrays: true }
        >;
      }

      return undefined;
    },
    onDone: () => {
      // process the final result (full type validation):
      const parseResult = schema.validate(lastStructure);

      if (parseResult.success) {
        resolveStructure(parseResult.data);
      } else {
        rejectStructure(parseResult.error);
      }
    },
  });

  return fullResponse
    ? {
        structureStream: callResponse.value,
        structurePromise,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
