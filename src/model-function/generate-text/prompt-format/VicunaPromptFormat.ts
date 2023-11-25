import { TextGenerationPromptFormat } from "../TextGenerationPromptFormat.js";
import { ChatPrompt, validateChatPrompt } from "./ChatPrompt.js";

// default Vicuna 1 system message
const DEFAULT_SYSTEM_MESSAGE =
  "A chat between a curious user and an artificial intelligence assistant. " +
  "The assistant gives helpful, detailed, and polite answers to the user's questions.";

/**
 * Formats a chat prompt as a Vicuna prompt.
 *
 * Overriding the system message in the first chat message can affect model responses.
 *
 * Vicuna prompt template:
 * ```
 * A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.
 *
 * USER: {prompt}
 * ASSISTANT:
 * ```
 */
export function chat(): TextGenerationPromptFormat<ChatPrompt, string> {
  return {
    format(prompt) {
      validateChatPrompt(prompt);

      let text =
        prompt.system != null
          ? `${prompt.system}\n\n`
          : `${DEFAULT_SYSTEM_MESSAGE}\n\n`;

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            text += `USER: ${content}\n`;
            break;
          }
          case "assistant": {
            text += `ASSISTANT: ${content}\n`;
            break;
          }
          default: {
            const _exhaustiveCheck: never = role;
            throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
          }
        }
      }

      // AI message prefix:
      text += `ASSISTANT: `;

      return text;
    },
    stopSequences: [`\nUSER:`],
  };
}
