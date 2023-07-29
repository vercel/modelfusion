import { LlamaCppTextGenerationModel } from "../model-provider/llamacpp/LlamaCppTextGenerationModel.js";
import { PromptMappedTextGenerationModel } from "./PromptMappedTextGenerationModel.js";
import { PromptMappedTextStreamingModel } from "./PromptMappedTextStreamingModel.js";
import { Instruction, PromptMapper } from "./PromptMapper.js";

export const llamaInstructionMapper: PromptMapper<Instruction, string> = {
  map: (instruction) =>
    "<s>[INST] <<SYS>>" +
    instruction.system +
    "<</SYS>> " +
    instruction.instruction +
    " [/INST]\n",
  stopTokens: ["</s>"],
};

export const Llama2Prompt = {
  forInstruction(model: LlamaCppTextGenerationModel) {
    return new PromptMappedTextGenerationModel({
      model: model.withSettings({
        stop: llamaInstructionMapper.stopTokens,
      }),
      promptMapper: llamaInstructionMapper,
    });
  },

  forInstructionAsStream(model: LlamaCppTextGenerationModel) {
    return new PromptMappedTextStreamingModel({
      model: model.withSettings({
        stop: llamaInstructionMapper.stopTokens,
      }),
      promptMapper: llamaInstructionMapper,
    });
  },
};
