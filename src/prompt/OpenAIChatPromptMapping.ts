import { OpenAIChatMessage } from "../model-provider/openai/chat/OpenAIChatMessage.js";
import { ChatPrompt, validateChatPrompt } from "./ChatPrompt.js";
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
  map: (chatPrompt) => {
    validateChatPrompt(chatPrompt);

    const messages: Array<OpenAIChatMessage> = [];

    for (let i = 0; i < chatPrompt.length; i++) {
      const message = chatPrompt[i];

      // system message:
      if (
        i === 0 &&
        "system" in message &&
        typeof message.system === "string"
      ) {
        messages.push({
          role: "system",
          content: message.system,
        });

        continue;
      }

      // user message
      if ("user" in message) {
        messages.push({
          role: "user",
          content: message.user,
        });

        continue;
      }

      // ai message:
      if ("ai" in message) {
        messages.push({
          role: "assistant",
          content: message.ai,
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
