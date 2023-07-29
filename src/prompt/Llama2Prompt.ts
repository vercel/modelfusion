import { LlamaCppTextGenerationModel } from "../model-provider/llamacpp/LlamaCppTextGenerationModel.js";
import { PromptMappedTextGenerationAndStreamingModel } from "./PromptMappedTextGenerationAndStreamingModel.js";
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
    return new PromptMappedTextGenerationAndStreamingModel({
      model: model.withSettings({
        stop: llamaInstructionMapper.stopTokens,
      }),
      promptMapper: llamaInstructionMapper,
    });
  },
};
