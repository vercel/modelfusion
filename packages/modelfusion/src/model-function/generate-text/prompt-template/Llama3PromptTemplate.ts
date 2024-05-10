import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate";
import { ChatPrompt } from "./ChatPrompt";
import { validateContentIsString } from "./ContentPart";
import { InstructionPrompt } from "./InstructionPrompt";
import { InvalidPromptError } from "./InvalidPromptError";

// See https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-3/

const BEGIN_SEGMENT = "<|begin_of_text|>"; // Doesn't appear to be needed, but is in documentation so leave it in
//const END_SEGMENT = "<|end_of_text|>"; // In the docs but never used as a sent item, or return AFAICS. Linter wont let it be defined and not used

const BEGIN_INSTRUCTION = "<|start_header_id|>user<|end_header_id|>\n\n";
const END_INSTRUCTION = "<|eot_id|>";

// This is the marker of an assistant response, or the end of the prompt to indicate it should carry on
const BEGIN_RESPONSE_ASSISTANT =
  "<|start_header_id|>assistant<|end_header_id|>\n\n";

const BEGIN_SYSTEM = "<|start_header_id|>system<|end_header_id|>\n\n";
const END_SYSTEM = "<|eot_id|>";

const STOP_SEQUENCE = "<|eot_id|>"; // <|eot_id|> is what the assistant sends to indicate it has finished and has no more to say

/**
 * Formats a text prompt as a Llama 3 prompt.
 *
 * Llama 3 prompt template:
 * ```
 * <|begin_of_text|><|start_header_id|>user<|end_header_id|>
 *
 * { instruction }<|eot_id|><|start_header_id|>assistant<|end_header_id|>
 *
 *
 * ```
 *
 * @see https://github.com/meta-llama/llama-recipes
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    stopSequences: [STOP_SEQUENCE],
    format(prompt) {
      let result = `${BEGIN_SEGMENT}${BEGIN_INSTRUCTION}${prompt}${END_INSTRUCTION}${BEGIN_RESPONSE_ASSISTANT}`;
      return result;
    },
  };
}

/**
 * Formats an instruction prompt as a Llama 3 prompt.
 *
 * Llama 3 prompt template:
 * ```
 * <|begin_of_text|><|start_header_id|>system<|end_header_id|>
 *
 * ${ system prompt }<|eot_id|><|start_header_id|>user<|end_header_id|>
 *
 * ${ instruction }<|eot_id|><|start_header_id|>assistant<|end_header_id|>
 *
 *
 * ```
 *
 * @see https://github.com/meta-llama/llama-recipes
 */
export function instruction(): TextGenerationPromptTemplate<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [STOP_SEQUENCE],
    format(prompt) {
      const instruction = validateContentIsString(prompt.instruction, prompt);

      let result = `${BEGIN_SEGMENT}`;
      result += `${prompt.system != null ? `${BEGIN_SYSTEM}${prompt.system}${END_SYSTEM}` : ""}`;
      result += `${BEGIN_INSTRUCTION}${instruction}${END_INSTRUCTION}${BEGIN_RESPONSE_ASSISTANT}`;
      return result;
    },
  };
}

/**
 * Formats a chat prompt as a Llama 3 prompt.
 *
 * Llama 3 prompt template:
 *
 * ```
 * <|begin_of_text|><|start_header_id|>system<|end_header_id|>
 *
 * ${ system prompt }<|eot_id|><|start_header_id|>user<|end_header_id|>
 *
 * ${ user msg 1 }<|eot_id|><|start_header_id|>assistant<|end_header_id|>
 *
 * ${ model response 1 }<|eot_id|><|start_header_id|>user<|end_header_id|>
 *
 * ${ user msg 2 }<|eot_id|><|start_header_id|>assistant<|end_header_id|>
 *
 * ${ model response 2 }<|eot_id|><|start_header_id|>user<|end_header_id|>
 *
 * ${ user msg 3 }<|eot_id|><|start_header_id|>assistant<|end_header_id|>
 *
 *
 * ```
 *
 * @see https://github.com/meta-llama/llama-recipes
 */
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    format(prompt) {
      validateLlama3Prompt(prompt);

      // get content of the first message (validated to be a user message)
      const content = prompt.messages[0].content;

      let text = `${BEGIN_SEGMENT}`;
      text += `${prompt.system != null ? `${BEGIN_SYSTEM}${prompt.system}${END_SYSTEM}` : ""}`;
      text += `${BEGIN_INSTRUCTION}${content}${END_INSTRUCTION}${BEGIN_RESPONSE_ASSISTANT}`;

      // process remaining messages
      for (let i = 1; i < prompt.messages.length; i++) {
        const { role, content } = prompt.messages[i];
        switch (role) {
          case "user": {
            const textContent = validateContentIsString(content, prompt);
            text += `${BEGIN_INSTRUCTION}${textContent}${END_INSTRUCTION}${BEGIN_RESPONSE_ASSISTANT}`;
            break;
          }
          case "assistant": {
            // The assistant will have added \n\n to the start of their response - we don't do that so the tests are slightly different than reality
            text += `${validateContentIsString(content, prompt)}${END_INSTRUCTION}`;
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
    stopSequences: [STOP_SEQUENCE],
  };
}

/**
 * Checks if a Llama3 chat prompt is valid. Throws a {@link ChatPromptValidationError} if it's not.
 *
 * - The first message of the chat must be a user message.
 * - Then it must be alternating between an assistant message and a user message.
 * - The last message must always be a user message (when submitting to a model).
 *
 * The type checking is done at runtime when you submit a chat prompt to a model with a prompt template.
 *
 * @throws {@link ChatPromptValidationError}
 */
export function validateLlama3Prompt(chatPrompt: ChatPrompt) {
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
