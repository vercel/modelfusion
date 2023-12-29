import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { validateContentIsString } from "./ContentPart.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { InvalidPromptError } from "./InvalidPromptError.js";

// see https://github.com/facebookresearch/llama/blob/6c7fe276574e78057f917549435a2554000a876d/llama/generation.py#L44
const BEGIN_SEGMENT = "<s>";
const END_SEGMENT = " </s>";
const BEGIN_INSTRUCTION = "[INST] ";
const END_INSTRUCTION = " [/INST] ";
const BEGIN_SYSTEM = "<<SYS>>\n";
const END_SYSTEM = "\n<</SYS>>\n\n";

/**
 * Formats a text prompt as a Llama 2 prompt.
 *
 * Llama 2 prompt template:
 * ```
 * <s>[INST] { instruction } [/INST]
 * ```
 *
 * @see https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      return `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${prompt}${END_INSTRUCTION}`;
    },
  };
}

/**
 * Formats an instruction prompt as a Llama 2 prompt.
 *
 * Llama 2 prompt template:
 * ```
 * <s>[INST] <<SYS>>
 * ${ system prompt }
 * <</SYS>>
 * ${ instruction }
 * [/INST]
 * ${ response prefix }
 * ```
 *
 * @see https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat
 */
export function instruction(): TextGenerationPromptTemplate<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      const instruction = validateContentIsString(prompt.instruction, prompt);

      return `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${
        prompt.system != null
          ? `${BEGIN_SYSTEM}${prompt.system}${END_SYSTEM}`
          : ""
      }${instruction}${END_INSTRUCTION}${prompt.responsePrefix ?? ""}`;
    },
  };
}

/**
 * Formats a chat prompt as a Llama 2 prompt.
 *
 * Llama 2 prompt template:
 * ```
 * <s>[INST] <<SYS>>
 * ${ system prompt }
 * <</SYS>>
 *
 * ${ user msg 1 } [/INST] ${ model response 1 } </s><s>[INST] ${ user msg 2 } [/INST] ${ model response 2 } </s><s>[INST] ${ user msg 3 } [/INST]
 * ```
 */
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    format(prompt) {
      validateLlama2Prompt(prompt);

      // get content of the first message (validated to be a user message)
      const content = prompt.messages[0].content;

      let text = `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${
        prompt.system != null
          ? `${BEGIN_SYSTEM}${prompt.system}${END_SYSTEM}`
          : ""
      }${content}${END_INSTRUCTION}`;

      // process remaining messages
      for (let i = 1; i < prompt.messages.length; i++) {
        const { role, content } = prompt.messages[i];
        switch (role) {
          case "user": {
            const textContent = validateContentIsString(content, prompt);
            text += `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${textContent}${END_INSTRUCTION}`;
            break;
          }
          case "assistant": {
            text += `${validateContentIsString(content, prompt)}${END_SEGMENT}`;
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

      return text;
    },
    stopSequences: [END_SEGMENT],
  };
}

/**
 * Checks if a Llama2 chat prompt is valid. Throws a {@link ChatPromptValidationError} if it's not.
 *
 * - The first message of the chat must be a user message.
 * - Then it must be alternating between an assistant message and a user message.
 * - The last message must always be a user message (when submitting to a model).
 *
 * The type checking is done at runtime when you submit a chat prompt to a model with a prompt template.
 *
 * @throws {@link ChatPromptValidationError}
 */
export function validateLlama2Prompt(chatPrompt: ChatPrompt) {
  const messages = chatPrompt.messages;

  if (messages.length < 1) {
    throw new InvalidPromptError(
      "ChatPrompt should have at least one message.",
      chatPrompt
    );
  }

  for (let i = 0; i < messages.length; i++) {
    const expectedRole = i % 2 === 0 ? "user" : "assistant";
    const role = messages[i].role;

    if (role !== expectedRole) {
      throw new InvalidPromptError(
        `Message at index ${i} should have role '${expectedRole}', but has role '${role}'.`,
        chatPrompt
      );
    }
  }

  if (messages.length % 2 === 0) {
    throw new InvalidPromptError(
      "The last message must be a user message.",
      chatPrompt
    );
  }
}
