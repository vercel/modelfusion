import { PromptMapping } from "./PromptMapping.js";
import { InstructionPrompt } from "./InstructionPrompt.js";

// see https://github.com/facebookresearch/llama/blob/6c7fe276574e78057f917549435a2554000a876d/llama/generation.py#L44
const BEGIN_INST = "[INST]";
const END_INST = "[/INST]";
const BEGIN_SYS = "<<SYS>>\n";
const END_SYS = "\n<</SYS>>\n\n";

/**
 * Maps an instruction prompt to the Llama2 prompt format.
 *
 * @see https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat
 */
export const InstructionToLlama2PromptMapping: () => PromptMapping<
  InstructionPrompt,
  string
> = () => ({
  stopTokens: ["</s>"],
  map: (instruction) =>
    `<s>${BEGIN_INST}${
      instruction.system != null
        ? ` ${BEGIN_SYS}${instruction.system}${END_SYS}`
        : ""
    } ${instruction.instruction} ${END_INST}\n`,
});
