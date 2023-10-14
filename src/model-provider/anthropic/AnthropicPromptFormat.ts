import { ChatPrompt } from "../../model-function/generate-text/ChatPrompt.js";
import { InstructionPrompt } from "../../model-function/generate-text/InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { validateChatPrompt } from "../../model-function/generate-text/validateChatPrompt.js";

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
 */
export function mapChatPromptToAnthropicFormat(): TextGenerationPromptFormat<
  ChatPrompt,
  string
> {
  return {
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      let text = "";

      for (let i = 0; i < chatPrompt.length; i++) {
        const message = chatPrompt[i];

        // system message:
        if (
          i === 0 &&
          "system" in message &&
          typeof message.system === "string"
        ) {
          text += `${message.system}\n\n`;
          continue;
        }

        // user message
        if ("user" in message) {
          text += `\n\nHuman:${message.user}`;
          continue;
        }

        // ai message:
        if ("ai" in message) {
          text += `\n\nAssistant:${message.ai}`;
          continue;
        }

        // unsupported message:
        throw new Error(`Unsupported message: ${JSON.stringify(message)}`);
      }

      // AI message prefix:
      text += `\n\nAssistant:`;

      return text;
    },
    stopSequences: [],
  };
}
