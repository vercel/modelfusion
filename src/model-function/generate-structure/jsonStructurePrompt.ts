import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { StructureFromTextPromptFormat } from "./StructureFromTextPromptFormat.js";

export function jsonStructurePrompt<SOURCE_PROMPT, TARGET_PROMPT>(
  createPrompt: (
    prompt: SOURCE_PROMPT,
    schema: Schema<unknown> & JsonSchemaProducer
  ) => TARGET_PROMPT
): StructureFromTextPromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  return {
    createPrompt,
    extractStructure: (response) => parseJSON({ text: response }),
  };
}
