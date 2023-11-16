import { ChatPrompt } from "../../model-function/generate-text/prompt-format/ChatPrompt.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-format/InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { validateChatPrompt } from "../../model-function/generate-text/prompt-format/validateChatPrompt.js";

/**
 * Formats an instruction prompt as an Anthropic prompt.
 */
export function mapInstructionPromptToAnthropicFormat(): TextGenerationPromptFormat<
  InstructionPrompt,
  string
> {
  return {
    format: (instruction) => {
      let text = "";

      if (instruction.system != null) {
        text += `${instruction.system}`;
      }

      text += "\n\nHuman:";

      text += instruction.instruction;

      if (instruction.input != null) {
        // use tags per Anthropic instruction:
        // https://docs.anthropic.com/claude/docs/constructing-a-prompt
        text += `\n\n<data>${instruction.input}</data>`;
      }

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
export function mapChatPromptToAnthropicFormat(): TextGenerationPromptFormat<
  ChatPrompt,
  string
> {
  return {
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      let text = chatPrompt.system != null ? `${chatPrompt.system}\n\n` : "";

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
