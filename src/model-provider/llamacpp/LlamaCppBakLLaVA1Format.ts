import { InstructionPrompt } from "../../model-function/generate-text/prompt-format/InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
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
export function instruction(): TextGenerationPromptFormat<
  InstructionPrompt,
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

      text += `ASSISTANT: `;

      return { text, images };
    },
    stopSequences: [`\nUSER:`],
  };
}
