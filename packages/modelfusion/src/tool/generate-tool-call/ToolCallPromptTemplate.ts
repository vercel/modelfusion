import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { Schema } from "../../core/schema/Schema";
import { ToolDefinition } from "../ToolDefinition";

export interface ToolCallPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  createPrompt(
    prompt: SOURCE_PROMPT,
    tool: ToolDefinition<string, unknown>
  ): TARGET_PROMPT;

  extractToolCall(
    response: string,
    tool: ToolDefinition<string, unknown>
  ): { id: string; args: unknown } | null;

  withJsonOutput?({
    model,
    schema,
  }: {
    model: {
      withJsonOutput(
        schema: Schema<unknown> & JsonSchemaProducer
      ): typeof model;
    };
    schema: Schema<unknown> & JsonSchemaProducer;
  }): typeof model;
}
