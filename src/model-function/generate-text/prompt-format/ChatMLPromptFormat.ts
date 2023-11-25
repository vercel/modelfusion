import { TextGenerationPromptFormat } from "../TextGenerationPromptFormat.js";
import { ChatPrompt, validateChatPrompt } from "./ChatPrompt.js";
import { TextInstructionPrompt } from "./InstructionPrompt.js";

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
 * Formats a text prompt using the ChatML format.
 */
export function text(): TextGenerationPromptFormat<string, string> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      // prompt and then prefix start of assistant response:
      return chatMLSegment("user", prompt) + chatMLStart("assistant");
    },
  };
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
export function instruction(): TextGenerationPromptFormat<
  TextInstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      return (
        chatMLSegment("system", prompt.system) +
        chatMLSegment("user", prompt.instruction) +
        chatMLStart("assistant") // prefix start of assistant response
      );
    },
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
export function chat(): TextGenerationPromptFormat<ChatPrompt, string> {
  return {
    format(prompt) {
      validateChatPrompt(prompt);

      let text =
        prompt.system != null ? chatMLSegment("system", prompt.system) : "";

      for (const { role, content } of prompt.messages) {
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
