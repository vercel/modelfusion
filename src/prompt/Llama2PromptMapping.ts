import { PromptMapping } from "./PromptMapping.js";
import { InstructionPrompt } from "./InstructionPrompt.js";

/**
 * Maps an instruction prompt to the Llama2 prompt format.
 *
 * @see https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat
 */
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
