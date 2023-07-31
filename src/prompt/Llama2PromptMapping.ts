import { PromptMapping } from "./PromptMapping.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { ChatPrompt, validateChatPrompt } from "./chat/ChatPrompt.js";

// see https://github.com/facebookresearch/llama/blob/6c7fe276574e78057f917549435a2554000a876d/llama/generation.py#L44
const BEGIN_SEGMENT = "<s>";
const END_SEGMENT = "</s>\n";
const BEGIN_INSTRUCTION = "[INST]";
const END_INSTRUCTION = "[/INST]";
const BEGIN_SYSTEM = "<<SYS>>\n";
const END_SYSTEM = "\n<</SYS>>\n\n";

/**
 * Maps an instruction prompt to the Llama2 prompt format.
 *
 * @see https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat
 */
export const InstructionToLlama2PromptMapping: () => PromptMapping<
  InstructionPrompt,
  string
> = () => ({
  stopTokens: [END_SEGMENT],
  map: (instruction) =>
    `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${
      instruction.system != null
        ? ` ${BEGIN_SYSTEM}${instruction.system}${END_SYSTEM}`
        : ""
    } ${instruction.instruction} ${END_INSTRUCTION}\n`,
});

export const ChatToLlama2PromptMapping: () => PromptMapping<
  ChatPrompt,
  string
> = () => ({
  map: (chatPrompt) => {
    validateChatPrompt(chatPrompt);

    let text = "";

    for (let i = 0; i < chatPrompt.length; i++) {
      const message = chatPrompt[i];

      // system message:
      if (
        i === 0 &&
        "system" in message &&
        typeof message.system === "string"
      ) {
        // Separate section for system message to simplify implementation
        // (this is slightly different from the original instructions):
        text += `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${BEGIN_SYSTEM}${message.system}${END_SYSTEM}${END_INSTRUCTION}${END_SEGMENT}`;
        continue;
      }

      // user message
      if ("user" in message) {
        text += `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${message.user}${END_INSTRUCTION}`;
        continue;
      }

      // ai message:
      if ("ai" in message) {
        text += `${message.ai}${END_SEGMENT}`;
        continue;
      }

      // unsupported message:
      throw new Error(`Unsupported message: ${JSON.stringify(message)}`);
    }

    return text;
  },
  stopTokens: [END_SEGMENT],
});
