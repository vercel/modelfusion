import { Tool } from "../../tool/Tool.js";
import { StructureDefinition } from "./StructureDefinition.js";

export type InstructionWithStructure<NAME extends string, STRUCTURE> = {
  instruction: string;
  structure: StructureDefinition<NAME, STRUCTURE>;
};

export const InstructionWithStructurePrompt = {
  forStructure<STRUCTURE>({
    instruction,
    structure,
  }: {
    instruction: string;
    structure: StructureDefinition<string, STRUCTURE>;
  }): InstructionWithStructure<string, STRUCTURE> {
    return { structure, instruction };
  },

  forTool<INPUT, OUTPUT>({
    instruction,
    tool,
  }: {
    instruction: string;
    tool: Tool<string, INPUT, OUTPUT>;
  }) {
    return InstructionWithStructurePrompt.forStructure({
      instruction,
      structure: tool.inputStructureDefinition,
    });
  },

  forToolCurried<INPUT, OUTPUT>(instruction: string) {
    return (tool: Tool<string, INPUT, OUTPUT>) =>
      this.forTool({ instruction, tool });
  },
};
