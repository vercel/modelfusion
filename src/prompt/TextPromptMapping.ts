import { PromptMapping } from "./PromptMapping.js";
import { InstructionPrompt } from "./InstructionPrompt.js";

export const InstructionToTextPromptMapping: () => PromptMapping<
  InstructionPrompt,
  string
> = () => ({
  stopTokens: [],
  map: (instruction) =>
    instruction.system != null
      ? `${instruction.system}\n\n${instruction.instruction}`
      : instruction.instruction,
});
