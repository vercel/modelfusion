import { ChatPrompt } from "../../model-function/generate-text/prompt-format/ChatPrompt.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-format/InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { validateChatPrompt } from "../../model-function/generate-text/prompt-format/validateChatPrompt.js";

/**
 * Formats a text prompt as an Anthropic prompt.
 */
export function text(): TextGenerationPromptFormat<string, string> {
  return {
    format: (instruction) => {
      let text = "";
      text += "\n\nHuman:";
      text += instruction;
      text += "\n\nAssistant:";

      return text;
    },
    stopSequences: [],
  };
}

/**
 * Formats an instruction prompt as an Anthropic prompt.
 */
export function instruction(): TextGenerationPromptFormat<
  InstructionPrompt,
  string
> {
  return {
    format: (instruction) => {
      let text = instruction.system ?? "";

      text += "\n\nHuman:";
      text += instruction.instruction;
      text += "\n\nAssistant:";

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
export function chat(): TextGenerationPromptFormat<ChatPrompt, string> {
  return {
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      let text = chatPrompt.system ?? "";

      for (const { role, content } of chatPrompt.messages) {
        switch (role) {
          case "user": {
            text += `\n\nHuman:${content}`;
            break;
          }
          case "assistant": {
            text += `\n\nAssistant:${content}`;
            break;
          }
          default: {
            const _exhaustiveCheck: never = role;
            throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
          }
        }
      }

      // AI message prefix:
      text += `\n\nAssistant:`;

      return text;
    },
    stopSequences: [],
  };
}
