import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate";
import { ChatPrompt } from "./ChatPrompt";
import { validateContentIsString } from "./ContentPart";
import { InstructionPrompt } from "./InstructionPrompt";
import { InvalidPromptError } from "./InvalidPromptError";

const END_SEGMENT = "<|end|>";

function segmentStart(role: "system" | "user" | "assistant") {
  return `<|${role}|>\n`;
}

function segment(
  role: "system" | "user" | "assistant",
  text: string | undefined
) {
  return text == null ? "" : `${segmentStart(role)}${text}${END_SEGMENT}\n`;
}

/**
 * Formats a text prompt using the Phi3 format.
 */
export function text(): TextGenerationPromptTemplate<string, string> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      // prompt and then prefix start of assistant response:
      return segment("user", prompt) + segmentStart("assistant");
    },
  };
}

/**
 * Formats an instruction prompt using the Phi3 format.
 *
 * Phi3 prompt template:
 * ```
 * <|system|>
 * ${ system prompt }<|end|>
 * <|user|>
 * ${ instruction }<|end|>
 * <|assistant|>
 * ${response prefix}
 * ```
 */
export function instruction(): TextGenerationPromptTemplate<
  InstructionPrompt,
  string
> {
  return {
    stopSequences: [END_SEGMENT],
    format(prompt) {
      const instruction = validateContentIsString(prompt.instruction, prompt);

      return (
        segment("system", prompt.system) +
        segment("user", instruction) +
        segmentStart("assistant") +
        (prompt.responsePrefix ?? "")
      );
    },
  };
}

/**
 * Formats a chat prompt using the Phi3 format.
 *
 * Phi3 prompt template:
 * ```
 * <|system|>
 * You are a helpful assistant that answers questions about the world.<|end|>
 * <|user|>
 * What is the capital of France?<|end|>
 * <|assistant|>
 * Paris<|end|>
 * ```
 */
export function chat(): TextGenerationPromptTemplate<ChatPrompt, string> {
  return {
    format(prompt) {
      let text = prompt.system != null ? segment("system", prompt.system) : "";

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            text += segment("user", validateContentIsString(content, prompt));
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
    stopSequences: [END_SEGMENT],
  };
}
