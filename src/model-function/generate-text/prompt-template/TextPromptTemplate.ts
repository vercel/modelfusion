import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { TextChatPrompt, validateChatPrompt } from "./ChatPrompt.js";
import { TextInstructionPrompt } from "./InstructionPrompt.js";

/**
 * Formats a text prompt as a basic text prompt. Does not change the text prompt in any way.
 */
export const text: () => TextGenerationPromptTemplate<string, string> = () => ({
  stopSequences: [],
  format: (prompt) => prompt,
});

/**
 * Formats an instruction prompt as a basic text prompt.
 */
export const instruction: () => TextGenerationPromptTemplate<
  TextInstructionPrompt,
  string
> = () => ({
  stopSequences: [],
  format(prompt) {
    let text = "";

    if (prompt.system != null) {
      text += `${prompt.system}\n\n`;
    }

    text += prompt.instruction;

    if (prompt.responsePrefix != null) {
      text += `\n\n${prompt.responsePrefix}`;
    }

    return text;
  },
});

/**
 * Formats a chat prompt as a basic text prompt.
 *
 * @param user The label of the user in the chat. Default to "user".
 * @param assistant The label of the assistant in the chat. Default to "assistant".
 * @param system The label of the system in the chat. Optional, defaults to no prefix.
 */
export const chat: (options?: {
  user?: string;
  assistant?: string;
  system?: string;
}) => TextGenerationPromptTemplate<TextChatPrompt, string> = ({
  user = "user",
  assistant = "assistant",
  system,
} = {}) => ({
  format(prompt) {
    validateChatPrompt(prompt);

    let text =
      prompt.system != null
        ? `${system != null ? `${system}:` : ""}${prompt.system}\n\n`
        : "";

    for (const { role, content } of prompt.messages) {
      switch (role) {
        case "user": {
          text += `${user}:\n${content}\n\n`;
          break;
        }
        case "assistant": {
          text += `${assistant}:\n${content}\n\n`;
          break;
        }
        default: {
          const _exhaustiveCheck: never = role;
          throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
        }
      }
    }

    // Assistant message prefix:
    text += `${assistant}:\n`;

    return text;
  },
  stopSequences: [`\n${user}:`],
});
