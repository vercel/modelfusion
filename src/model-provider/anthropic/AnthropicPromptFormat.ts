import { ChatPrompt } from "../../prompt/chat/ChatPrompt.js";
import { validateChatPrompt } from "../../prompt/chat/validateChatPrompt.js";
import { InstructionPrompt } from "../../prompt/InstructionPrompt.js";
import { PromptFormat } from "../../prompt/PromptFormat.js";

/**
 * Formats an instruction prompt as an Anthropic prompt.
 */
export function mapInstructionPromptToAnthropicFormat(): PromptFormat<
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
        text += `\n\n${instruction.input}`;
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
export function mapChatPromptToAnthropicFormat(): PromptFormat<
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
