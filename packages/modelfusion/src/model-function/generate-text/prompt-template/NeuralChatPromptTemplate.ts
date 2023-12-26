import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { validateContentIsString } from "./ContentPart.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { InvalidPromptError } from "./InvalidPromptError.js";

const roleNames = {
  system: "System",
  user: "User",
  assistant: "Assistant",
};

function segmentStart(role: "system" | "user" | "assistant") {
  return `### ${roleNames[role]}:\n`;
}

function segment(
  role: "system" | "user" | "assistant",
  text: string | undefined
) {
  return text == null ? "" : `${segmentStart(role)}${text}\n`;
}

/**
 * Formats a text prompt as a neural chat prompt.
 *
 * @see https://huggingface.co/Intel/neural-chat-7b-v3-1#prompt-template
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    stopSequences: [],
    format(prompt) {
      // prompt and then prefix start of assistant response:
      return segment("user", prompt) + segmentStart("assistant");
    },
  };
}

/**
 * Formats an instruction prompt as a neural chat prompt.
 *
 * @see https://huggingface.co/Intel/neural-chat-7b-v3-1#prompt-template
 */
export const instruction: () => TextGenerationPromptTemplate<
  InstructionPrompt,
  string
> = () => ({
  stopSequences: [],
  format(prompt) {
    const instruction = validateContentIsString(prompt.instruction, prompt);

    return (
      segment("system", prompt.system) +
      segment("user", instruction) +
      segmentStart("assistant") +
      (prompt.responsePrefix ?? "")
    );
  },
});

/**
 * Formats a chat prompt as a basic text prompt.
 *
 * @param user The label of the user in the chat. Default to "user".
 * @param assistant The label of the assistant in the chat. Default to "assistant".
 * @param system The label of the system in the chat. Optional, defaults to no prefix.
 */
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    format(prompt) {
      let text = prompt.system != null ? segment("system", prompt.system) : "";

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            const textContent = validateContentIsString(content, prompt);
            text += segment("user", textContent);
            break;
          }
          case "assistant": {
            text += segment(
              "assistant",
              validateContentIsString(content, prompt)
            );
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

      // prefix start of assistant response:
      text += segmentStart("assistant");

      return text;
    },
    stopSequences: [`\n${roleNames.user}:`],
  };
}
