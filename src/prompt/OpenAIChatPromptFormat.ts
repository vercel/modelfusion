import { OpenAIChatMessage } from "../model-provider/openai/chat/OpenAIChatMessage.js";
import { ChatPrompt } from "./chat/ChatPrompt.js";
import { validateChatPrompt } from "./chat/validateChatPrompt.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { PromptFormat } from "./PromptFormat.js";

/**
 * Formats an instruction prompt as an OpenAI chat prompt.
 */
export const OpenAIChatInstructionPromptFormat: () => PromptFormat<
  InstructionPrompt,
  Array<OpenAIChatMessage>
> = () => ({
  format: (instruction) => {
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

    if (instruction.input != null) {
      messages.push({
        role: "user",
        content: instruction.input,
      });
    }

    return messages;
  },
  stopTokens: [],
});

/**
 * Formats a chat prompt as an OpenAI chat prompt.
 */
export const OpenAIChatChatPromptFormat: () => PromptFormat<
  ChatPrompt,
  Array<OpenAIChatMessage>
> = () => ({
  format: (chatPrompt) => {
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
