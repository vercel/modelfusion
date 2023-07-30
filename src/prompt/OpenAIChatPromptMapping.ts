import { OpenAIChatMessage } from "../model-provider/openai/chat/OpenAIChatMessage.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { PromptMapping } from "./PromptMapping.js";

export const InstructionToOpenAIChatPromptMapping: () => PromptMapping<
  InstructionPrompt,
  Array<OpenAIChatMessage>
> = () => ({
  map: (instruction) => {
    const messages: Array<OpenAIChatMessage> = [];

    if (instruction.system != null) {
      messages.push({
        role: "system",
        content: instruction.system,
      });
    }

    messages.push({
      role: "user",
      content: instruction.instruction,
    });

    return messages;
  },
  stopTokens: [],
});

export const ChatToOpenAIChatPromptMapping: () => PromptMapping<
  ChatPrompt,
  Array<OpenAIChatMessage>
> = () => ({
  map: (chat) => {
    const messages: Array<OpenAIChatMessage> = [];

    for (let i = 0; i < chat.length; i++) {
      const message = chat[i];

      // system message:
      if (i === 0 && "system" in message) {
        messages.push({
          role: "system",
          content: message.system,
        });

        continue;
      }

      // message pair:
      if ("user" in message && "ai" in message) {
        messages.push({
          role: "user",
          content: message.user,
        });
        messages.push({
          role: "assistant",
          content: message.ai,
        });

        continue;
      }

      // final user message:
      if (i === chat.length - 1 && "user" in message) {
        messages.push({
          role: "user",
          content: message.user,
        });

        continue;
      }

      // unsupported message:
      throw new Error(`Unsupported message: ${JSON.stringify(message)}`);
    }

    return messages;
  },
  stopTokens: [],
});
