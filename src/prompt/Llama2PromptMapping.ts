import { PromptMapping } from "./PromptMapping.js";
import { InstructionPrompt } from "./InstructionPrompt.js";

export const Llama2InstructionPromptMapping: PromptMapping<
  InstructionPrompt,
  string
> = {
  stopTokens: ["</s>"],
  map: (instruction) =>
    `<s>[INST]${
      instruction.system != null ? ` <<SYS>>${instruction.system}<</SYS>>` : ""
    } ${instruction.instruction} [/INST]\n`,
};
