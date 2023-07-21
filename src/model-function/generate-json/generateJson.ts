import { z } from "zod";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationPrompt,
} from "./JsonGenerationModel.js";

export type SchemaDefinition<NAME extends string, STRUCTURE> = {
  name: NAME;
  description?: string;
  schema: z.Schema<STRUCTURE>;
};

export function generateJsonForSchema<
  STRUCTURE,
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinition: SchemaDefinition<any, STRUCTURE>,
  prompt: (
    schemaDefinition: SchemaDefinition<any, STRUCTURE>
  ) => PROMPT & JsonGenerationPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<STRUCTURE> {
  const expandedPrompt = prompt(schemaDefinition);

  return executeCall({
    model,
    options,
    callModel: (model, options) =>
      generateJsonForSchema(model, schemaDefinition, prompt, options),
    generateResponse: (options) =>
      model.generateJsonResponse(expandedPrompt, options),
    extractOutputValue: (response): STRUCTURE => {
      const { fnName, json } = expandedPrompt.extractJson(response);

      if (fnName != schemaDefinition.name) {
        // TODO special error
        throw new Error(
          `Expected function name "${schemaDefinition.name}", got "${fnName}"`
        );
      }

      // TODO introduce special error for parse failures
      return schemaDefinition.schema.parse(json);
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

// { fnName: "n", value: STRUCTURE } | ...
type ToFnNameValuePair<T> = {
  [KEY in keyof T]: { fnName: KEY; value: T[KEY] };
}[keyof T];

type ToOutputValue<
  STRUCTURES extends SchemaDefinitionArray<SchemaDefinition<any, any>[]>
> = ToFnNameValuePair<ToTypedMap<ToSchemaDefinitionsMap<STRUCTURES>>>;

export function generateJsonOrTextForSchemas<
  STRUCTURES extends SchemaDefinition<any, any>[],
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  schemaDefinitions: STRUCTURES,
  prompt: (
    schemaDefinitions: STRUCTURES
  ) => PROMPT & JsonGenerationPrompt<RESPONSE>,
  options?: FunctionOptions<SETTINGS>
): Promise<{ fnName: null; value: string } | ToOutputValue<STRUCTURES>> {
  const expandedPrompt = prompt(schemaDefinitions);

  return executeCall({
    model,
    options,
    callModel: (model, options) =>
      generateJsonOrTextForSchemas(model, schemaDefinitions, prompt, options),
    generateResponse: (options) =>
      model.generateJsonResponse(expandedPrompt, options),
    extractOutputValue: (response) => {
      const { fnName, json } = expandedPrompt.extractJson(response);

      // text generation:
      if (fnName == null) {
        // TODO validate that the value is a string

        return { fnName, value: json as string };
      }

      const definition = schemaDefinitions.find((d) => d.name === fnName);

      if (definition == undefined) {
        // TODO special error
        throw new Error(`Unknown function name: ${fnName}`);
      }

      return {
        fnName,
        // TODO introduce special error for parse failures
        value: definition.schema.parse(json),
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
