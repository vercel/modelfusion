import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import {
  TextChatPrompt,
  validateChatPrompt,
} from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { TextInstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { MistralTextGenerationPrompt } from "./MistralTextGenerationModel.js";

/**
 * Formats a text prompt as a Mistral prompt.
 */
export function text(): TextGenerationPromptTemplate<
  string,
  MistralTextGenerationPrompt
> {
  return {
    format: (prompt) => [{ role: "user", content: prompt }],
    stopSequences: [],
  };
}

/**
 * Formats an instruction prompt as a Mistral prompt.
 */
export function instruction(): TextGenerationPromptTemplate<
  TextInstructionPrompt,
  MistralTextGenerationPrompt
> {
  return {
    format(prompt) {
      const messages: MistralTextGenerationPrompt = [];

      if (prompt.system != null) {
        messages.push({ role: "system", content: prompt.system });
      }

      messages.push({ role: "user", content: prompt.instruction });

      return messages;
    },
    stopSequences: [],
  };
}

/**
 * Formats a chat prompt as a Mistral prompt.
 */
export function chat(): TextGenerationPromptTemplate<
  TextChatPrompt,
  MistralTextGenerationPrompt
> {
  return {
    format(prompt) {
      validateChatPrompt(prompt);

      const messages: MistralTextGenerationPrompt = [];

      if (prompt.system != null) {
        messages.push({ role: "system", content: prompt.system });
      }

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            messages.push({ role: "user", content });
            break;
          }
          case "assistant": {
            messages.push({ role: "assistant", content });
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
