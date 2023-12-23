import { validateContentIsString } from "../../model-function/generate-text/prompt-template/Content.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { ChatPrompt } from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";

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
  InstructionPrompt,
  string
> {
  return {
    format(prompt) {
      const instruction = validateContentIsString(prompt.instruction, prompt);

      let text = prompt.system ?? "";

      text += HUMAN_PREFIX;
      text += instruction;
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
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    format(prompt) {
      let text = prompt.system ?? "";

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            const textContent = validateContentIsString(content, prompt);

            text += HUMAN_PREFIX;
            text += textContent;
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
