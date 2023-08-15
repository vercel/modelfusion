import { Tool } from "../../tool/Tool.js";
import { SchemaDefinition } from "./SchemaDefinition.js";

export type InstructionWithSchema<NAME extends string, STRUCTURE> = {
  instruction: string;
  schemaDefinition: SchemaDefinition<NAME, STRUCTURE>;
};

export const InstructionWithSchemaPrompt = {
  forSchema<STRUCTURE>({
    instruction,
    schemaDefinition,
  }: {
    instruction: string;
    schemaDefinition: SchemaDefinition<string, STRUCTURE>;
  }) {
    return { schemaDefinition, instruction };
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
      schemaDefinition: tool.inputSchemaDefinition,
    });
  },

  forToolCurried<INPUT, OUTPUT>(instruction: string) {
    return (tool: Tool<string, INPUT, OUTPUT>) =>
      this.forTool({ instruction, tool });
  },
};
