import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { TextChatPrompt } from "./ChatPrompt.js";
import { TextInstructionPrompt } from "./InstructionPrompt.js";
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
 * <s>[INST]{ instruction } [/INST]
 * ```
 *
 * @see https://www.philschmid.de/llama-2#how-to-prompt-llama-2-chat
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      return `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${prompt}${END_INSTRUCTION}\n`;
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
  TextInstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      return `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${
        prompt.system != null
          ? `${BEGIN_SYSTEM}${prompt.system}${END_SYSTEM}`
          : ""
      }${prompt.instruction}${END_INSTRUCTION}${prompt.responsePrefix ?? ""}`;
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
export function chat(): TextGenerationPromptTemplate<TextChatPrompt, string> {
  return {
    format(prompt) {
      validateLlama2hatPrompt(prompt);

      let text =
        prompt.system != null
          ? // Separate section for system message to simplify implementation
            // (this is slightly different from the original instructions):
            `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${BEGIN_SYSTEM}${prompt.system}${END_SYSTEM}${END_INSTRUCTION}${END_SEGMENT}`
          : "";

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            text += `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${content}${END_INSTRUCTION}`;
            break;
          }
          case "assistant": {
            text += `${content}${END_SEGMENT}`;
            break;
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
export function validateLlama2hatPrompt(chatPrompt: TextChatPrompt) {
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
