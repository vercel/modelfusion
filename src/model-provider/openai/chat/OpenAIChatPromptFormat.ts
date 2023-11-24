import { TextGenerationPromptFormat } from "../../../model-function/generate-text/TextGenerationPromptFormat.js";
import { ChatPrompt } from "../../../model-function/generate-text/prompt-format/ChatPrompt.js";
import {
  InstructionPrompt,
  TextInstructionPrompt,
} from "../../../model-function/generate-text/prompt-format/InstructionPrompt.js";
import { validateChatPrompt } from "../../../model-function/generate-text/prompt-format/ChatPrompt.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";

/**
 * Formats a text prompt as an OpenAI chat prompt.
 */
export function text(): TextGenerationPromptFormat<
  string,
  Array<OpenAIChatMessage>
> {
  return {
    format: (prompt) => [OpenAIChatMessage.user(prompt)],
    stopSequences: [],
  };
}

/**
 * Formats an instruction prompt as an OpenAI chat prompt.
 */
export function instruction(): TextGenerationPromptFormat<
  InstructionPrompt | TextInstructionPrompt,
  Array<OpenAIChatMessage>
> {
  return {
    format(prompt) {
      const messages: Array<OpenAIChatMessage> = [];

      if (prompt.system != null) {
        messages.push(OpenAIChatMessage.system(prompt.system));
      }

      messages.push(OpenAIChatMessage.user(prompt.instruction));

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
    format(prompt) {
      validateChatPrompt(prompt);

      const messages: Array<OpenAIChatMessage> = [];

      if (prompt.system != null) {
        messages.push(OpenAIChatMessage.system(prompt.system));
      }

      for (const { role, content } of prompt.messages) {
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
