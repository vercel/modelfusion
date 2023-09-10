import { Tool } from "../../tool/Tool.js";
import { SchemaDescription } from "./SchemaDescription.js";

export type InstructionWithSchema<NAME extends string, STRUCTURE> = {
  instruction: string;
  schema: SchemaDescription<NAME, STRUCTURE>;
};

export const InstructionWithSchemaPrompt = {
  forSchema<STRUCTURE>({
    instruction,
    schema,
  }: {
    instruction: string;
    schema: SchemaDescription<string, STRUCTURE>;
  }): InstructionWithSchema<string, STRUCTURE> {
    return { schema, instruction };
  },

  forTool<INPUT, OUTPUT>({
    instruction,
    tool,
  }: {
    instruction: string;
    tool: Tool<string, INPUT, OUTPUT>;
  }) {
    return InstructionWithSchemaPrompt.forSchema({
      instruction,
      schema: tool.inputSchemaDescription,
    });
  },

  forToolCurried<INPUT, OUTPUT>(instruction: string) {
    return (tool: Tool<string, INPUT, OUTPUT>) =>
      this.forTool({ instruction, tool });
  },
};
