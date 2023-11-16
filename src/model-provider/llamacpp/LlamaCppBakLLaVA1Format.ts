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
    format: (instruction) => {
      let text = "";

      text += `${instruction.system ?? DEFAULT_SYSTEM_MESSAGE}\n\n`;

      text += `USER: `;

      if (instruction.image != null) {
        text += `[img-1]\n`;
      }

      text += `${instruction.instruction}\n`;

      if (instruction.input != null) {
        text += `${instruction.input}\n`;
      }

      text += `ASSISTANT: `;

      return {
        text,
        images:
          instruction.image != null
            ? { "1": instruction.image.base64Content }
            : undefined,
      };
    },
    stopSequences: [`\nUSER:`],
  };
}
