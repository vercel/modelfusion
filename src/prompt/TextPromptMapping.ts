import { PromptMapping } from "./PromptMapping.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { ChatPrompt } from "./chat/ChatPrompt.js";
import { validateChatPrompt } from "./chat/validateChatPrompt.js";

export const InstructionToTextPromptMapping: () => PromptMapping<
  InstructionPrompt,
  string
> = () => ({
  stopTokens: [],
  map: (instruction) => {
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
 * A mapping from a chat prompt to a text prompt.
 *
 * @param user The label of the user in the chat.
 * @param ai The name of the AI in the chat.
 */
export const ChatToTextPromptMapping: ({
  user,
  ai,
}: {
  user: string;
  ai: string;
}) => PromptMapping<ChatPrompt, string> = ({ user, ai }) => ({
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
  stopTokens: [`\n${user}:`],
});
