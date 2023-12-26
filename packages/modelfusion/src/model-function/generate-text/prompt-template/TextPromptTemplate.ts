import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { validateContentIsString } from "./ContentPart.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { InvalidPromptError } from "./InvalidPromptError.js";

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
  InstructionPrompt,
  string
> = () => ({
  stopSequences: [],
  format(prompt) {
    let text = "";

    if (prompt.system != null) {
      text += `${prompt.system}\n\n`;
    }

    text += `${validateContentIsString(prompt.instruction, prompt)}\n\n`;

    if (prompt.responsePrefix != null) {
      text += prompt.responsePrefix;
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
}) => TextGenerationPromptTemplate<ChatPrompt, string> = ({
  user = "user",
  assistant = "assistant",
  system,
} = {}) => ({
  format(prompt) {
    let text =
      prompt.system != null
        ? `${system != null ? `${system}:` : ""}${prompt.system}\n\n`
        : "";

    for (const { role, content } of prompt.messages) {
      switch (role) {
        case "user": {
          text += `${user}:\n${validateContentIsString(content, prompt)}\n\n`;
          break;
        }
        case "assistant": {
          text += `${assistant}:\n${validateContentIsString(
            content,
            prompt
          )}\n\n`;
          break;
        }
        case "tool": {
          throw new InvalidPromptError(
            "Tool messages are not supported.",
            prompt
          );
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
