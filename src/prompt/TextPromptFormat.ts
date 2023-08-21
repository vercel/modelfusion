import { PromptFormat } from "./PromptFormat.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { ChatPrompt } from "./chat/ChatPrompt.js";
import { validateChatPrompt } from "./chat/validateChatPrompt.js";

/**
 * Formats an instruction prompt as a basic text prompt.
 */
export const TextInstructionPromptFormat: () => PromptFormat<
  InstructionPrompt,
  string
> = () => ({
  stopSequences: [],
  format: (instruction) => {
    let text = "";

    if (instruction.system != null) {
      text += `${instruction.system}\n\n`;
    }

    text += instruction.instruction;

    if (instruction.input != null) {
      text += `\n\n${instruction.input}`;
    }

    return text;
  },
});

/**
 * Formats a chat prompt as a basic text prompt.
 *
 * @param user The label of the user in the chat.
 * @param ai The name of the AI in the chat.
 */
export const TextChatPromptFormat: ({
  user,
  ai,
}: {
  user: string;
  ai: string;
}) => PromptFormat<ChatPrompt, string> = ({ user, ai }) => ({
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

      // user message
      if ("user" in message) {
        text += `${user}:\n${message.user}\n\n`;
        continue;
      }

      // ai message:
      if ("ai" in message) {
        text += `${ai}:\n${message.ai}\n\n`;
        continue;
      }

      // unsupported message:
      throw new Error(`Unsupported message: ${JSON.stringify(message)}`);
    }

    // AI message prefix:
    text += `${ai}:\n`;

    return text;
  },
  stopSequences: [`\n${user}:`],
});
