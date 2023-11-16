import { ChatPrompt } from "./ChatPrompt.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../TextGenerationPromptFormat.js";
import { validateChatPrompt } from "./validateChatPrompt.js";

const START_SEGMENT = "<|im_start|>";
const END_SEGMENT = "<|im_end|>";

function chatMLStart(role: "system" | "user" | "assistant") {
  return `${START_SEGMENT}${role}\n`;
}

function chatMLSegment(
  role: "system" | "user" | "assistant",
  text: string | undefined
) {
  return text == null ? "" : `${chatMLStart(role)}${text}${END_SEGMENT}\n`;
}

/**
 * Formats an instruction prompt using the ChatML format.
 *
 * ChatML prompt template:
 * ```
 * <|im_start|>system
 * You are a helpful assistant that answers questions about the world.<|im_end|>
 * <|im_start|>user
 * What is the capital of France?<|im_end|>
 * <|im_start|>assistant
 * Paris<|im_end|>
 * ```
 */
export function mapInstructionPromptToChatMLFormat(): TextGenerationPromptFormat<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format: (instruction) =>
      chatMLSegment("system", instruction.system) +
      chatMLSegment(
        "user",
        instruction.instruction + instruction.input != null
          ? `\n\n${instruction.input}`
          : ""
      ),
  };
}

/**
 * Formats a chat prompt using the ChatML format.
 *
 * ChatML prompt template:
 * ```
 * <|im_start|>system
 * You are a helpful assistant that answers questions about the world.<|im_end|>
 * <|im_start|>user
 * What is the capital of France?<|im_end|>
 * <|im_start|>assistant
 * Paris<|im_end|>
 * ```
 */
export function mapChatPromptToChatMLFormat(): TextGenerationPromptFormat<
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
          // Separate section for system message to simplify implementation
          // (this is slightly different from the original instructions):
          text += chatMLSegment("system", message.system);
          continue;
        }

        // user message
        if ("user" in message) {
          text += chatMLSegment("user", message.user);
          continue;
        }

        // ai message:
        if ("ai" in message) {
          text += chatMLSegment("assistant", message.ai);
          continue;
        }

        // unsupported message:
        throw new Error(`Unsupported message: ${JSON.stringify(message)}`);
      }

      // prefix start of assistant response:
      text += chatMLStart("assistant");

      return text;
    },
    stopSequences: [END_SEGMENT],
  };
}
