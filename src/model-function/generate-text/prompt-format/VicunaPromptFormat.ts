import { ChatPrompt } from "./ChatPrompt.js";
import { TextGenerationPromptFormat } from "../TextGenerationPromptFormat.js";
import { validateChatPrompt } from "./validateChatPrompt.js";

// default Vicuna 1 system message
const DEFAULT_SYSTEM_MESSAGE =
  "A chat between a curious user and an artificial intelligence assistant. " +
  "The assistant gives helpful, detailed, and polite answers to the user's questions.";

/**
 * Formats a chat prompt as a Vicuna prompt.
 *
 * Overridding the system message in the first chat message can affect model respones.
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
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      let text =
        chatPrompt.system != null
          ? `${chatPrompt.system}\n\n`
          : `${DEFAULT_SYSTEM_MESSAGE}\n\n`;

      for (const { role, content } of chatPrompt.messages) {
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
