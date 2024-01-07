import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import {
  FlexibleStructureFromTextPromptTemplate,
  StructureFromTextPromptTemplate,
} from "./StructureFromTextPromptTemplate.js";

const DEFAULT_SCHEMA_PREFIX = "JSON schema:";
const DEFAULT_SCHEMA_SUFFIX =
  "\nYou MUST answer with a JSON object matches the above schema.";

export const jsonStructurePrompt = {
  custom<SOURCE_PROMPT, TARGET_PROMPT>(
    createPrompt: (
      prompt: SOURCE_PROMPT,
      schema: Schema<unknown> & JsonSchemaProducer
    ) => TARGET_PROMPT
  ): StructureFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
    return { createPrompt, extractStructure };
  },

  text({
    schemaPrefix,
    schemaSuffix,
  }: {
    schemaPrefix?: string;
    schemaSuffix?: string;
  } = {}): FlexibleStructureFromTextPromptTemplate<string, InstructionPrompt> {
    return {
      createPrompt: (
        prompt: string,
        schema: Schema<unknown> & JsonSchemaProducer
      ) => ({
        system: createSystemPrompt({ schema, schemaPrefix, schemaSuffix }),
        instruction: prompt,
      }),
      extractStructure,
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
  } = {}): FlexibleStructureFromTextPromptTemplate<
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
      extractStructure,
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

function extractStructure(response: string): unknown {
  return parseJSON({ text: response });
}
