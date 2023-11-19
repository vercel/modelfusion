import { ChatPrompt } from "./ChatPrompt.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../TextGenerationPromptFormat.js";
import { validateChatPrompt } from "./validateChatPrompt.js";

// see https://github.com/facebookresearch/llama/blob/6c7fe276574e78057f917549435a2554000a876d/llama/generation.py#L44
const BEGIN_SEGMENT = "<s>";
const END_SEGMENT = "</s>";
const BEGIN_INSTRUCTION = "[INST]";
const END_INSTRUCTION = "[/INST]";
const BEGIN_SYSTEM = "<<SYS>>\n";
const END_SYSTEM = "\n<</SYS>>\n\n";

/**
 * Formats an instruction prompt as a Llama 2 prompt.
 *
 * Llama 2 prompt template:
 * ```
 * <s>[INST] <<SYS>>
 * ${ system prompt }
 * <</SYS>>
 *
 * { instruction } [/INST]
 * ```
 *
 * @see https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat
 */
export function instruction(): TextGenerationPromptFormat<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format: (instruction) =>
      `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${
        instruction.system != null
          ? ` ${BEGIN_SYSTEM}${instruction.system}${END_SYSTEM}`
          : ""
      } ${instruction.instruction}${
        instruction.input != null ? `\n\n${instruction.input}` : ""
      } ${END_INSTRUCTION}\n`,
  };
}

/**
 * Formats a chat prompt as a Llama 2 prompt.
 *
 * Llama 2 prompt template:
 * ```
 * <s>[INST] <<SYS>>
 * ${ system prompt }
 * <</SYS>>
 *
 * ${ user msg 1 } [/INST] ${ model response 1 } </s><s>[INST] ${ user msg 2 } [/INST] ${ model response 2 } </s><s>[INST] ${ user msg 3 } [/INST]
 * ```
 */
export function chat(): TextGenerationPromptFormat<ChatPrompt, string> {
  return {
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      let text =
        chatPrompt.system != null
          ? // Separate section for system message to simplify implementation
            // (this is slightly different from the original instructions):
            `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${BEGIN_SYSTEM}${chatPrompt.system}${END_SYSTEM}${END_INSTRUCTION}${END_SEGMENT}`
          : "";

      for (const { role, content } of chatPrompt.messages) {
        switch (role) {
          case "user": {
            text += `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${content}${END_INSTRUCTION}`;
            break;
          }
          case "assistant": {
            text += `${content}${END_SEGMENT}`;
            break;
          }
          default: {
            const _exhaustiveCheck: never = role;
            throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
          }
        }
      }

      return text;
    },
    stopSequences: [END_SEGMENT],
  };
}
