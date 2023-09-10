import { Tool } from "../../tool/Tool.js";
import { FunctionDescription } from "./FunctionDescription.js";

export type InstructionWithFunction<NAME extends string, STRUCTURE> = {
  instruction: string;
  fn: FunctionDescription<NAME, STRUCTURE>;
};

export const InstructionWithFunctionPrompt = {
  forFunction<STRUCTURE>({
    instruction,
    fn,
  }: {
    instruction: string;
    fn: FunctionDescription<string, STRUCTURE>;
  }) {
    return { fn, instruction };
  },

  forTool<INPUT, OUTPUT>({
    instruction,
    tool,
  }: {
    instruction: string;
    tool: Tool<string, INPUT, OUTPUT>;
  }) {
    return InstructionWithFunctionPrompt.forFunction({
      instruction,
      fn: tool,
    });
  },

  forToolCurried<INPUT, OUTPUT>(instruction: string) {
    return (tool: Tool<string, INPUT, OUTPUT>) =>
      this.forTool({ instruction, tool });
  },
};
