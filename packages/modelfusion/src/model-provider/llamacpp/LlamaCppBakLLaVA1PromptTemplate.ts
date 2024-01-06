import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { ChatPrompt } from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { validateContentIsString } from "../../model-function/generate-text/prompt-template/ContentPart.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { InvalidPromptError } from "../../model-function/generate-text/prompt-template/InvalidPromptError.js";
import { text as vicunaText } from "../../model-function/generate-text/prompt-template/TextPromptTemplate.js";
import { LlamaCppCompletionPrompt } from "./LlamaCppCompletionModel.js";

// default Vicuna 1 system message
const DEFAULT_SYSTEM_MESSAGE =
  "A chat between a curious user and an artificial intelligence assistant. " +
  "The assistant gives helpful, detailed, and polite answers to the user's questions.";

/**
 * Text prompt.
 */
export function text(): TextGenerationPromptTemplate<
  string,
  LlamaCppCompletionPrompt
> {
  const delegate = vicunaText();
  return {
    stopSequences: [],
    format(prompt) {
      return { text: delegate.format(prompt) };
    },
  };
}

/**
 * BakLLaVA 1 uses a Vicuna 1 prompt. This mapping combines it with the LlamaCpp prompt structure.
 *
 * @see https://github.com/SkunkworksAI/BakLLaVA
 */
export function instruction(): TextGenerationPromptTemplate<
  InstructionPrompt,
  LlamaCppCompletionPrompt
> {
  return {
    format(prompt) {
      let text = "";

      text += `${prompt.system ?? DEFAULT_SYSTEM_MESSAGE}\n\n`;

      text += `USER: `;

      const images: Record<string, string> = {};

      if (typeof prompt.instruction === "string") {
        text += `${prompt.instruction}\n`;
      } else {
        // construct text and image mapping:
        let imageCounter = 1;
        for (const content of prompt.instruction) {
          switch (content.type) {
            case "text": {
              text += content.text;
              break;
            }
            case "image": {
              text += `[img-${imageCounter}]`;
              images[imageCounter.toString()] = content.base64Image;
              imageCounter++;
              break;
            }
          }

          text += `${content}\n`;
        }
      }

      text += `\nASSISTANT: `;

      return { text, images };
    },
    stopSequences: [`\nUSER:`],
  };
}

export function chat(): TextGenerationPromptTemplate<
  ChatPrompt,
  LlamaCppCompletionPrompt
> {
  return {
    format(prompt) {
      let text = "";

      text += `${prompt.system ?? DEFAULT_SYSTEM_MESSAGE}\n\n`;

      // construct text and image mapping:
      let imageCounter = 1;
      const images: Record<string, string> = {};

      for (const { role, content } of prompt.messages) {
        switch (role) {
          case "user": {
            text += `USER: `;

            if (typeof content === "string") {
              text += content;
              break;
            }

            for (const part of content) {
              switch (part.type) {
                case "text": {
                  text += part.text;
                  break;
                }
                case "image": {
                  text += `[img-${imageCounter}]`;
                  images[imageCounter.toString()] = part.base64Image;
                  imageCounter++;
                  break;
                }
              }
            }

            break;
          }
          case "assistant": {
            text += `ASSISTANT: ${validateContentIsString(content, prompt)}`;
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

        text += `\n\n`;
      }

      text += `ASSISTANT: `;

      return { text, images };
    },
    stopSequences: [`\nUSER:`],
  };
}
