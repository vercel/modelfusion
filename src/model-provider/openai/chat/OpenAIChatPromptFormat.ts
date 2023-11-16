import { TextGenerationPromptFormat } from "../../../model-function/generate-text/TextGenerationPromptFormat.js";
import { ChatPrompt } from "../../../model-function/generate-text/prompt-format/ChatPrompt.js";
import { InstructionPrompt } from "../../../model-function/generate-text/prompt-format/InstructionPrompt.js";
import { validateChatPrompt } from "../../../model-function/generate-text/prompt-format/validateChatPrompt.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";

/**
 * Formats an instruction prompt as an OpenAI chat prompt.
 */
export function instruction(): TextGenerationPromptFormat<
  InstructionPrompt,
  Array<OpenAIChatMessage>
> {
  return {
    format: (instruction) => {
      const messages: Array<OpenAIChatMessage> = [];

      if (instruction.system != null) {
        messages.push(OpenAIChatMessage.system(instruction.system));
      }

      messages.push(
        OpenAIChatMessage.user(instruction.instruction, {
          image: instruction.image,
        })
      );

      if (instruction.input != null) {
        messages.push(OpenAIChatMessage.user(instruction.input));
      }

      return messages;
    },
    stopSequences: [],
  };
}

/**
 * Formats a chat prompt as an OpenAI chat prompt.
 */
export function chat(): TextGenerationPromptFormat<
  ChatPrompt,
  Array<OpenAIChatMessage>
> {
  return {
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      const messages: Array<OpenAIChatMessage> = [];

      if (chatPrompt.system != null) {
        messages.push(OpenAIChatMessage.system(chatPrompt.system));
      }

      for (const { role, content } of chatPrompt.messages) {
        switch (role) {
          case "user": {
            messages.push(OpenAIChatMessage.user(content));
            break;
          }
          case "assistant": {
            messages.push(OpenAIChatMessage.assistant(content));
            break;
          }
          default: {
            const _exhaustiveCheck: never = role;
            throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
          }
        }
      }

      return messages;
    },
    stopSequences: [],
  };
}
