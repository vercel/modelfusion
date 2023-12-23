import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { MultiModalChatPrompt } from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { MultiModalInstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { LlamaCppTextGenerationPrompt } from "./LlamaCppTextGenerationModel.js";

// default Vicuna 1 system message
const DEFAULT_SYSTEM_MESSAGE =
  "A chat between a curious user and an artificial intelligence assistant. " +
  "The assistant gives helpful, detailed, and polite answers to the user's questions.";

/**
 * BakLLaVA 1 uses a Vicuna 1 prompt. This mapping combines it with the LlamaCpp prompt structure.
 *
 * @see https://github.com/SkunkworksAI/BakLLaVA
 */
export function instruction(): TextGenerationPromptTemplate<
  MultiModalInstructionPrompt,
  LlamaCppTextGenerationPrompt
> {
  return {
    format(prompt) {
      let text = "";

      text += `${prompt.system ?? DEFAULT_SYSTEM_MESSAGE}\n\n`;

      text += `USER: `;

      // construct text and image mapping:
      let imageCounter = 1;
      const images: Record<string, string> = {};
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

      text += `\nASSISTANT: `;

      return { text, images };
    },
    stopSequences: [`\nUSER:`],
  };
}

export function chat(): TextGenerationPromptTemplate<
  MultiModalChatPrompt,
  LlamaCppTextGenerationPrompt
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
            text += `ASSISTANT: ${content}`;
            break;
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
