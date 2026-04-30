import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate";
import { ChatPrompt } from "./ChatPrompt";
import { validateContentIsString } from "./ContentPart";
import { InstructionPrompt } from "./InstructionPrompt";
import { InvalidPromptError } from "./InvalidPromptError";

const END_OF_TURN = "<|end_of_turn|>";
const USER_PREFIX = "GPT4 Correct User: ";
const ASSISTANT_PREFIX = "GPT4 Correct Assistant:";

function userSegment(text: string) {
  return `${USER_PREFIX}${text}${END_OF_TURN}`;
}

function assistantSegment(text: string) {
  return `${ASSISTANT_PREFIX} ${text}${END_OF_TURN}`;
}

function systemSegment(text: string | undefined) {
  return text == null ? "" : `${text}${END_OF_TURN}`;
}

/**
 * Formats a text prompt as an OpenChat prompt.
 *
 * OpenChat prompt template:
 * ```
 * GPT4 Correct User: { prompt }<|end_of_turn|>GPT4 Correct Assistant:
 * ```
 *
 * @see https://github.com/imoneoi/openchat#conversation-templates
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    stopSequences: [END_OF_TURN],
    format(prompt) {
      return `${userSegment(prompt)}${ASSISTANT_PREFIX}`;
    },
  };
}

/**
 * Formats an instruction prompt as an OpenChat prompt.
 *
 * OpenChat prompt template with a system prompt:
 * ```
 * ${ system prompt }<|end_of_turn|>GPT4 Correct User: ${ instruction }<|end_of_turn|>GPT4 Correct Assistant:${ response prefix }
 * ```
 *
 * @see https://github.com/imoneoi/openchat#conversation-templates
 */
export function instruction(): TextGenerationPromptTemplate<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [END_OF_TURN],
    format(prompt) {
      const instruction = validateContentIsString(prompt.instruction, prompt);

      return (
        systemSegment(prompt.system) +
        userSegment(instruction) +
        ASSISTANT_PREFIX +
        (prompt.responsePrefix ?? "")
      );
    },
  };
}

/**
 * Formats a chat prompt as an OpenChat prompt.
 *
 * OpenChat prompt template:
 * ```
 * GPT4 Correct User: ${ user msg 1 }<|end_of_turn|>GPT4 Correct Assistant: ${ model response 1 }<|end_of_turn|>GPT4 Correct User: ${ user msg 2 }<|end_of_turn|>GPT4 Correct Assistant:
 * ```
 *
 * @see https://github.com/imoneoi/openchat#conversation-templates
 */
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    stopSequences: [END_OF_TURN],
    format(prompt) {
      validateOpenChatPrompt(prompt);

      let text = systemSegment(prompt.system);

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            text += userSegment(validateContentIsString(content, prompt));
            break;
          }
          case "assistant": {
            text += assistantSegment(validateContentIsString(content, prompt));
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

      return text + ASSISTANT_PREFIX;
    },
  };
}

/**
 * Checks if an OpenChat chat prompt is valid.
 *
 * - The first message of the chat must be a user message.
 * - Then it must alternate between assistant and user messages.
 * - The last message must be a user message when submitting to the model.
 *
 * @throws {@link InvalidPromptError}
 */
export function validateOpenChatPrompt(chatPrompt: ChatPrompt) {
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
