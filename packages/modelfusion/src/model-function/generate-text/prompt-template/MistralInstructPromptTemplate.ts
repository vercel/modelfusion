import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { validateContentIsString } from "./ContentPart.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { InvalidPromptError } from "./InvalidPromptError.js";

const BEGIN_SEGMENT = "<s>";
const END_SEGMENT = "</s>";
const BEGIN_INSTRUCTION = "[INST] ";
const END_INSTRUCTION = " [/INST] ";
/**
 * Formats a text prompt as a Mistral instruct prompt.
 *
 * Mistral prompt template:
 * ```
 * <s>[INST] { instruction } [/INST]
 * ```
 *
 * @see https://docs.mistral.ai/models/#chat-template
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
 * Formats an instruction prompt as a Mistral instruct prompt.
 *
 * Note that Mistral does not support system prompts. We emulate them.
 *
 * Mistral prompt template when system prompt is set:
 * ```
 * <s>[INST] ${ system prompt } [/INST] </s>[INST] ${instruction} [/INST] ${ response prefix }
 * ```
 *
 * Mistral prompt template when there is no system prompt:
 * ```
 * <s>[INST] ${ instruction } [/INST] ${ response prefix }
 * ```
 *
 * @see https://docs.mistral.ai/models/#chat-template
 */
export function instruction(): TextGenerationPromptTemplate<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      const instruction = validateContentIsString(prompt.instruction, prompt);

      if (prompt.system != null) {
        return `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${
          prompt.system
        }${END_INSTRUCTION}${END_SEGMENT}${BEGIN_INSTRUCTION}${instruction}${END_INSTRUCTION}${
          prompt.responsePrefix ?? ""
        }`;
      }

      return `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${instruction}${END_INSTRUCTION}${
        prompt.responsePrefix ?? ""
      }`;
    },
  };
}

/**
 * Formats a chat prompt as a Mistral instruct prompt.
 *
 * Note that Mistral does not support system prompts. We emulate them.
 *
 * Mistral prompt template when system prompt is set:
 * ```
 * <s>[INST] ${ system prompt } [/INST] </s> [INST] ${ user msg 1 } [/INST] ${ model response 1 } [INST] ${ user msg 2 } [/INST] ${ model response 2 } [INST] ${ user msg 3 } [/INST]
 * ```
 *
 * Mistral prompt template when there is no system prompt:
 * ```
 * <s>[INST] ${ user msg 1 } [/INST] ${ model response 1 } </s>[INST] ${ user msg 2 } [/INST] ${ model response 2 } [INST] ${ user msg 3 } [/INST]
 * ```
 *
 * @see https://docs.mistral.ai/models/#chat-template
 */
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    format(prompt) {
      validateMistralPrompt(prompt);

      let text = "";
      let i = 0;

      // handle the special first segment
      if (prompt.system != null) {
        text += `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${prompt.system}${END_INSTRUCTION}${END_SEGMENT}`;
      } else {
        // get content of the first message (validated to be a user message)
        text = `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${prompt.messages[0].content}${END_INSTRUCTION}`;

        // process 2nd message (validated to be an assistant message)
        if (prompt.messages.length > 1) {
          text += `${prompt.messages[1].content}${END_SEGMENT}`;
        }

        i = 2;
      }

      // process remaining messages
      for (; i < prompt.messages.length; i++) {
        const { role, content } = prompt.messages[i];
        switch (role) {
          case "user": {
            const textContent = validateContentIsString(content, prompt);
            text += `${BEGIN_INSTRUCTION}${textContent}${END_INSTRUCTION}`;
            break;
          }
          case "assistant": {
            text += validateContentIsString(content, prompt);
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
 * Checks if a Mistral chat prompt is valid. Throws a {@link ChatPromptValidationError} if it's not.
 *
 * - The first message of the chat must be a user message.
 * - Then it must be alternating between an assistant message and a user message.
 * - The last message must always be a user message (when submitting to a model).
 *
 * The type checking is done at runtime when you submit a chat prompt to a model with a prompt template.
 *
 * @throws {@link ChatPromptValidationError}
 */
export function validateMistralPrompt(chatPrompt: ChatPrompt) {
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
