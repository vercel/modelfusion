import { FunctionOptions } from "../FunctionOptions.js";
import { CallMetadata, executeCall } from "../executeCall.js";
import {
  GenerateJsonOrTextModel,
  GenerateJsonOrTextModelSettings,
  GenerateJsonOrTextPrompt,
} from "./GenerateJsonOrTextModel.js";
import { NoSuchSchemaError } from "./NoSuchSchemaError.js";
import { SchemaDefinition } from "./SchemaDefinition.js";
import { SchemaValidationError } from "./SchemaValidationError.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

// [ { name: "n", schema: z.object<SCHEMA> } | { ... } ]
type SchemaDefinitionArray<T extends SchemaDefinition<any, any>[]> = T;

// { n: { name: "n", schema: z.object<SCHEMA> }, ... }
type ToSchemaDefinitionsMap<
  T extends SchemaDefinitionArray<SchemaDefinition<any, any>[]>,
> = {
  [K in T[number]["name"]]: Extract<T[number], SchemaDefinition<K, any>>;
};

// { schema: "n", value: SCHEMA } | ...
type ToSchemaUnion<T> = {
  [KEY in keyof T]: T[KEY] extends SchemaDefinition<any, infer SCHEMA>
    ? { schema: KEY; value: SCHEMA; text: string | null }
    : never;
}[keyof T];

type ToOutputValue<
  SCHEMAS extends SchemaDefinitionArray<SchemaDefinition<any, any>[]>,
> = ToSchemaUnion<ToSchemaDefinitionsMap<SCHEMAS>>;

export async function generateJsonOrText<
  SCHEMAS extends SchemaDefinition<any, any>[],
  PROMPT,
  RESPONSE,
  SETTINGS extends GenerateJsonOrTextModelSettings,
>(
  model: GenerateJsonOrTextModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinitions: SCHEMAS,
  prompt: (
    schemaDefinitions: SCHEMAS
  ) => PROMPT & GenerateJsonOrTextPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<
  ({ schema: null; value: null; text: string } | ToOutputValue<SCHEMAS>) & {
    response: RESPONSE;
    metadata: CallMetadata<GenerateJsonOrTextModel<PROMPT, RESPONSE, SETTINGS>>;
  }
> {
  const expandedPrompt = prompt(schemaDefinitions);

  const result = await executeCall({
    model,
    options,
    generateResponse: (options) =>
      model.generateJsonResponse(expandedPrompt, options),
    extractOutputValue: (
      response
    ): { schema: null; value: null; text: string } | ToOutputValue<SCHEMAS> => {
      const { schema, value, text } =
        expandedPrompt.extractJsonAndText(response);

      // text generation:
      if (schema == null) {
        return { schema, value, text };
      }

      const definition = schemaDefinitions.find((d) => d.name === schema);

      if (definition == undefined) {
        throw new NoSuchSchemaError(schema);
      }

      const parseResult = definition.schema.safeParse(value);

      if (!parseResult.success) {
        throw new SchemaValidationError({
          schemaName: schema,
          value,
          errors: parseResult.error,
        });
      }

      return {
        schema: schema as ToOutputValue<SCHEMAS>["schema"],
        value: parseResult.data,
        text: text as any, // text is string | null, which is part of the response for schema values
      };
    },
    getStartEvent: (metadata, settings) => ({
      type: "json-generation-started",
      metadata,
      settings,
      prompt,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "json-generation-finished",
      status: "abort",
      metadata,
      settings,
      prompt,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "json-generation-finished",
      status: "failure",
      metadata,
      settings,
      prompt,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "json-generation-finished",
      status: "success",
      metadata,
      settings,
      prompt,
      response,
      generatedJson: output,
    }),
  });

  return {
    ...result.output,
    response: result.response,
    metadata: result.metadata,
  };
}
