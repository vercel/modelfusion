import { z } from "zod";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationPrompt,
} from "./JsonGenerationModel.js";

export function generateJson<
  T,
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  prompt: PROMPT & JsonGenerationPrompt<RESPONSE, T>,
  options?: FunctionOptions<SETTINGS>
): Promise<T> {
  return executeCall({
    model,
    options,
    callModel: (model, options) => generateJson(model, prompt, options),
    generateResponse: (options) =>
      model.generateJsonForSchemaResponse(prompt, options),
    extractOutputValue: (response): T => prompt.extractJson(response),
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
      model.generateJsonForSchemaResponse(expandedPrompt, options),
    extractOutputValue: (response): STRUCTURE => {
      // TODO introduce special error
      const unsafeJson = expandedPrompt.extractJson(response);
      return schemaDefinition.schema.parse(unsafeJson);
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
      model.generateJsonForSchemaResponse(expandedPrompt, options),
    extractOutputValue: (response) => {
      // TODO introduce special error
      // const unsafeJson = expandedPrompt.extractJson(response);
      // return schemaDefinition.schema.parse(unsafeJson);
      return {
        fnName: null,
        value: "",
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
