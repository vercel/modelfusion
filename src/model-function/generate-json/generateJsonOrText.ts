import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  JsonOrTextGenerationModel,
  JsonOrTextGenerationModelSettings,
  JsonOrTextGenerationPrompt,
} from "./JsonOrTextGenerationModel.js";
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

export function generateJsonOrText<
  SCHEMAS extends SchemaDefinition<any, any>[],
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonOrTextGenerationModelSettings,
>(
  model: JsonOrTextGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinitions: SCHEMAS,
  prompt: (
    schemaDefinitions: SCHEMAS
  ) => PROMPT & JsonOrTextGenerationPrompt<RESPONSE>,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<
  { schema: null; value: null; text: string } | ToOutputValue<SCHEMAS>,
  RESPONSE
> {
  const expandedPrompt = prompt(schemaDefinitions);

  return executeCall({
    functionType: "json-or-text-generation",
    input: expandedPrompt,
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
    extractUsage: (result) => model.extractUsage?.(result),
  });
}
