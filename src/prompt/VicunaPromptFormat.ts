import { PromptFormat } from "./PromptFormat.js";
import { ChatPrompt } from "./chat/ChatPrompt.js";
import { validateChatPrompt } from "./chat/validateChatPrompt.js";

const DEFAULT_SYSTEM_PROMPT =
  "A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.";

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
export const VicunaChatPromptFormat: () => PromptFormat<
  ChatPrompt,
  string
> = () => ({
  format: (chatPrompt) => {
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
        text += `${message.system}\n\n`;
        continue;
      }

      // first message was not a system message:
      if (i === 0) {
        text += `${DEFAULT_SYSTEM_PROMPT}\n\n`;
      }

      // user message
      if ("user" in message) {
        text += `USER: ${message.user}\n`;
        continue;
      }

      // ai message:
      if ("ai" in message) {
        text += `ASSISTANT:\n${message.ai}\n`;
        continue;
      }

      // unsupported message:
      throw new Error(`Unsupported message: ${JSON.stringify(message)}`);
    }

    // AI message prefix:
    text += `ASSISTANT: `;

    return text;
  },
  stopTokens: [`\nUSER:`],
});
