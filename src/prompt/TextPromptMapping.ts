import { PromptMapping } from "./PromptMapping.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { ChatPrompt, validateChatPrompt } from "./ChatPrompt.js";

export const InstructionToTextPromptMapping: () => PromptMapping<
  InstructionPrompt,
  string
> = () => ({
  stopTokens: [],
  map: (instruction) =>
    instruction.system != null
      ? `${instruction.system}\n\n${instruction.instruction}`
      : instruction.instruction,
});

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

    // Add AI message starter
    text += `${ai}:\n`;

    return text;
  },
  stopTokens: [`\n${user}:`],
});
