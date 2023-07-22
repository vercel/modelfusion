import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  GenerateJsonOrTextPrompt,
  GenerateJsonOrTextModel,
  GenerateJsonOrTextModelSettings,
} from "./GenerateJsonOrTextModel.js";
import { NoSuchSchemaError } from "./NoSuchSchemaError.js";
import { SchemaDefinition } from "./SchemaDefinition.js";

// [ { name: "n", schema: z.object<STRUCTURE> } | { ... } ]
type SchemaDefinitionArray<T extends SchemaDefinition<any, any>[]> = T;

// { n: { name: "n", schema: z.object<STRUCTURE> }, ... }
type ToSchemaDefinitionsMap<
  T extends SchemaDefinitionArray<SchemaDefinition<any, any>[]>
> = {
  [K in T[number]["name"]]: Extract<T[number], SchemaDefinition<K, any>>;
};

// { n: STRUCTURE, ... }
type ToTypedMap<T> = {
  [K in keyof T]: T[K] extends SchemaDefinition<any, infer U> ? U : never;
};

// { schema: "n", value: STRUCTURE } | ...
type ToSchemaNameValuePair<T> = {
  [KEY in keyof T]: { schema: KEY; value: T[KEY] };
}[keyof T];

type ToOutputValue<
  STRUCTURES extends SchemaDefinitionArray<SchemaDefinition<any, any>[]>
> = ToSchemaNameValuePair<ToTypedMap<ToSchemaDefinitionsMap<STRUCTURES>>>;

export function generateJsonOrText<
  STRUCTURES extends SchemaDefinition<any, any>[],
  PROMPT,
  RESPONSE,
  SETTINGS extends GenerateJsonOrTextModelSettings
>(
  model: GenerateJsonOrTextModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinitions: STRUCTURES,
  prompt: (
    schemaDefinitions: STRUCTURES
  ) => PROMPT & GenerateJsonOrTextPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<{ schema: null; value: string } | ToOutputValue<STRUCTURES>> {
  const expandedPrompt = prompt(schemaDefinitions);

  return executeCall({
    model,
    options,
    callModel: (model, options) =>
      generateJsonOrText(model, schemaDefinitions, prompt, options),
    generateResponse: (options) =>
      model.generateJsonResponse(expandedPrompt, options),
    extractOutputValue: (response) => {
      const { schema, value } = expandedPrompt.extractJson(response);

      // text generation:
      if (schema == null) {
        return { schema, value };
      }

      const definition = schemaDefinitions.find((d) => d.name === schema);

      if (definition == undefined) {
        throw new NoSuchSchemaError(schema);
      }

      return {
        schema,
        // TODO introduce special error for parse failures
        value: definition.schema.parse(value),
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
}
