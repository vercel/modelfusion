import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { Schema } from "../../core/schema/Schema";
import { parseJSON } from "../../core/schema/parseJSON";
import { InstructionPrompt } from "../generate-text/prompt-template/InstructionPrompt";
import {
  FlexibleObjectFromTextPromptTemplate,
  ObjectFromTextPromptTemplate,
} from "./ObjectFromTextPromptTemplate";

const DEFAULT_SCHEMA_PREFIX = "JSON schema:";
const DEFAULT_SCHEMA_SUFFIX =
  "\nYou MUST answer with a JSON object matches the above schema.";

export const jsonObjectPrompt = {
  custom<SOURCE_PROMPT, TARGET_PROMPT>(
    createPrompt: (
      prompt: SOURCE_PROMPT,
      schema: Schema<unknown> & JsonSchemaProducer
    ) => TARGET_PROMPT
  ): ObjectFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
    return { createPrompt, extractObject };
  },

  text({
    schemaPrefix,
    schemaSuffix,
  }: {
    schemaPrefix?: string;
    schemaSuffix?: string;
  } = {}): FlexibleObjectFromTextPromptTemplate<string, InstructionPrompt> {
    return {
      createPrompt: (
        prompt: string,
        schema: Schema<unknown> & JsonSchemaProducer
      ) => ({
        system: createSystemPrompt({ schema, schemaPrefix, schemaSuffix }),
        instruction: prompt,
      }),
      extractObject,
      adaptModel: (model) => model.withInstructionPrompt(),
      withJsonOutput: ({ model, schema }) => model.withJsonOutput(schema),
    };
  },

  instruction({
    schemaPrefix,
    schemaSuffix,
  }: {
    schemaPrefix?: string;
    schemaSuffix?: string;
  } = {}): FlexibleObjectFromTextPromptTemplate<
    InstructionPrompt,
    InstructionPrompt
  > {
    return {
      createPrompt: (
        prompt: InstructionPrompt,
        schema: Schema<unknown> & JsonSchemaProducer
      ) => ({
        system: createSystemPrompt({
          originalSystemPrompt: prompt.system,
          schema,
          schemaPrefix,
          schemaSuffix,
        }),
        instruction: prompt.instruction,
      }),
      extractObject,
      adaptModel: (model) => model.withInstructionPrompt(),
      withJsonOutput: ({ model, schema }) => model.withJsonOutput(schema),
    };
  },
};

function createSystemPrompt({
  originalSystemPrompt,
  schema,
  schemaPrefix = DEFAULT_SCHEMA_PREFIX,
  schemaSuffix = DEFAULT_SCHEMA_SUFFIX,
}: {
  originalSystemPrompt?: string;
  schema: Schema<unknown> & JsonSchemaProducer;
  schemaPrefix?: string;
  schemaSuffix?: string;
}) {
  return [
    originalSystemPrompt,
    schemaPrefix,
    JSON.stringify(schema.getJsonSchema()),
    schemaSuffix,
  ]
    .filter(Boolean)
    .join("\n");
}

function extractObject(response: string): unknown {
  return parseJSON({ text: response });
}
