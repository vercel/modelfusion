import { ChatPrompt } from "./ChatPrompt.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../TextGenerationPromptFormat.js";
import { validateChatPrompt } from "./validateChatPrompt.js";

const START_SEGMENT = "<|im_start|>";
const END_SEGMENT = "<|im_end|>";

function chatMLStart(role: "system" | "user" | "assistant") {
  return `${START_SEGMENT}${role}\n`;
}

function chatMLSegment(
  role: "system" | "user" | "assistant",
  text: string | undefined
) {
  return text == null ? "" : `${chatMLStart(role)}${text}${END_SEGMENT}\n`;
}

/**
 * Formats an instruction prompt using the ChatML format.
 *
 * ChatML prompt template:
 * ```
 * <|im_start|>system
 * You are a helpful assistant that answers questions about the world.<|im_end|>
 * <|im_start|>user
 * What is the capital of France?<|im_end|>
 * <|im_start|>assistant
 * Paris<|im_end|>
 * ```
 */
export function mapInstructionPromptToChatMLFormat(): TextGenerationPromptFormat<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format: (instruction) =>
      chatMLSegment("system", instruction.system) +
      chatMLSegment(
        "user",
        instruction.instruction + instruction.input != null
          ? `\n\n${instruction.input}`
          : ""
      ),
  };
}

/**
 * Formats a chat prompt using the ChatML format.
 *
 * ChatML prompt template:
 * ```
 * <|im_start|>system
 * You are a helpful assistant that answers questions about the world.<|im_end|>
 * <|im_start|>user
 * What is the capital of France?<|im_end|>
 * <|im_start|>assistant
 * Paris<|im_end|>
 * ```
 */
export function mapChatPromptToChatMLFormat(): TextGenerationPromptFormat<
  ChatPrompt,
  string
> {
  return {
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      let text =
        chatPrompt.system != null
          ? chatMLSegment("system", chatPrompt.system)
          : "";

      for (const { role, content } of chatPrompt.messages) {
        switch (role) {
          case "user": {
            text += chatMLSegment("user", content);
            break;
          }
          case "assistant": {
            text += chatMLSegment("assistant", content);
            break;
          }
          default: {
            const _exhaustiveCheck: never = role;
            throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
          }
        }
      }

      // prefix start of assistant response:
      text += chatMLStart("assistant");

      return text;
    },
    stopSequences: [END_SEGMENT],
  };
}
