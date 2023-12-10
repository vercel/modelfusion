import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";

export type StructureFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> = {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    schema: Schema<unknown> & JsonSchemaProducer
  ) => TARGET_PROMPT;
  extractStructure: (response: string) => unknown;
};
