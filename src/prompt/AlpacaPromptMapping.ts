import { InstructionPrompt } from "./InstructionPrompt.js";
import { PromptMapping } from "./PromptMapping.js";

const DEFAULT_SYSTEM_PROMPT_INPUT =
  "Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.";
const DEFAULT_SYSTEM_PROMPT_NO_INPUT =
  "Below is an instruction that describes a task. Write a response that appropriately completes the request.";

/**
 * Maps an instruction prompt to the Alpaca prompt format.
 *
 * If the instruction has a system prompt, it overrides the default system prompt
 * (which can impact the results, because the model may be trained on the default system prompt).
 *
 * @see https://github.com/tatsu-lab/stanford_alpaca#data-release
 */
export const InstructionToAlpacaPromptMapping: () => PromptMapping<
  InstructionPrompt,
  string
> = () => ({
  stopTokens: [],
  map: (instruction) => {
    let text =
      instruction.system ??
      (instruction.input != null
        ? DEFAULT_SYSTEM_PROMPT_INPUT
        : DEFAULT_SYSTEM_PROMPT_NO_INPUT);

    text += "\n\n### Instruction:\n";

    if (instruction.system != null) {
      text += `${instruction.system}\n`;
    }

    text += instruction.instruction;

    if (instruction.input != null) {
      text += `\n\n### Input:\n${instruction.input}`;
    }

    text += "\n\n### Response:\n";

    return text;
  },
});
