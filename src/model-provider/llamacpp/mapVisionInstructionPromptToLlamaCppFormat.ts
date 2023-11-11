import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { VisionInstructionPrompt } from "../../model-function/generate-text/prompt-format/VisionInstructionPrompt.js";
import { LlamaCppTextGenerationPrompt } from "./LlamaCppTextGenerationModel.js";

export function mapVisionInstructionPromptToLlamaCppFormat(): TextGenerationPromptFormat<
  VisionInstructionPrompt,
  LlamaCppTextGenerationPrompt
> {
  return {
    format: ({ instruction, image }) => {
      return {
        text: `[img-1]\n\n${instruction}`,
        images: { "1": image },
      };
    },
    stopSequences: [],
  };
}
