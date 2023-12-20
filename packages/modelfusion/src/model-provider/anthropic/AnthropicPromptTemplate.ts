import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import {
  TextChatPrompt,
  validateChatPrompt,
} from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { TextInstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";

const HUMAN_PREFIX = "\n\nHuman:";
const ASSISTANT_PREFIX = "\n\nAssistant:";

/**
 * Formats a text prompt as an Anthropic prompt.
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    format(prompt) {
      let text = "";
      text += HUMAN_PREFIX;
      text += prompt;
      text += ASSISTANT_PREFIX;
      return text;
    },
    stopSequences: [],
  };
}

/**
 * Formats an instruction prompt as an Anthropic prompt.
 */
export function instruction(): TextGenerationPromptTemplate<
  TextInstructionPrompt,
  string
> {
  return {
    format(prompt) {
      let text = prompt.system ?? "";

      text += HUMAN_PREFIX;
      text += prompt.instruction;
      text += ASSISTANT_PREFIX;

      if (prompt.responsePrefix != null) {
        text += prompt.responsePrefix;
      }

      return text;
    },
    stopSequences: [],
  };
}

/**
 * Formats a chat prompt as an Anthropic prompt.
 *
 * @see https://docs.anthropic.com/claude/docs/constructing-a-prompt
 */
export function chat(): TextGenerationPromptTemplate<TextChatPrompt, string> {
  return {
    format(prompt) {
      validateChatPrompt(prompt);

      let text = prompt.system ?? "";

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            text += HUMAN_PREFIX;
            text += content;
            break;
          }
          case "assistant": {
            text += ASSISTANT_PREFIX;
            text += content;
            break;
          }
          default: {
            const _exhaustiveCheck: never = role;
            throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
          }
        }
      }

      // AI message prefix:
      text += ASSISTANT_PREFIX;

      return text;
    },
    stopSequences: [],
  };
}
