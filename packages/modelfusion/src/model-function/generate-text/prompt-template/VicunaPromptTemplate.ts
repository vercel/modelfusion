import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { validateContentIsString } from "./ContentPart.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { InvalidPromptError } from "./InvalidPromptError.js";

// default Vicuna 1 system message
const DEFAULT_SYSTEM_MESSAGE =
  "A chat between a curious user and an artificial intelligence assistant. " +
  "The assistant gives helpful, detailed, and polite answers to the user's questions.";

/**
 * Formats a text prompt as a Vicuna prompt.
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    stopSequences: [],
    format(prompt) {
      let text = DEFAULT_SYSTEM_MESSAGE;
      text += "\n\nUSER: ";
      text += prompt;
      text += "\n\nASSISTANT: ";
      return text;
    },
  };
}

/**
 * Formats an instruction prompt as a Vicuna prompt.
 */
export const instruction = (): TextGenerationPromptTemplate<
  InstructionPrompt,
  string
> => ({
  stopSequences: [`\nUSER:`],
  format(prompt) {
    let text =
      prompt.system != null
        ? `${prompt.system}\n\n`
        : `${DEFAULT_SYSTEM_MESSAGE}\n\n`;

    text += `USER: ${validateContentIsString(prompt.instruction, prompt)}\n`;
    text += `ASSISTANT: `;

    return text;
  },
});

/**
 * Formats a chat prompt as a Vicuna prompt.
 *
 * Overriding the system message in the first chat message can affect model responses.
 *
 * Vicuna prompt template:
 * ```
 * A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.
 *
 * USER: {prompt}
 * ASSISTANT:
 * ```
 */
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    format(prompt) {
      let text =
        prompt.system != null
          ? `${prompt.system}\n\n`
          : `${DEFAULT_SYSTEM_MESSAGE}\n\n`;

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            const textContent = validateContentIsString(content, prompt);
            text += `USER: ${textContent}\n`;
            break;
          }
          case "assistant": {
            text += `ASSISTANT: ${validateContentIsString(content, prompt)}\n`;
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

      // AI message prefix:
      text += `ASSISTANT: `;

      return text;
    },
    stopSequences: [`\nUSER:`],
  };
}
