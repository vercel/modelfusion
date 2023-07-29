import { Instruction, PromptMapping } from "./PromptMapping.js";

export const Llama2PromptForInstruction: PromptMapping<Instruction, string> = {
  stopTokens: ["</s>"],
  map: (instruction) =>
    "<s>[INST] <<SYS>>" +
    instruction.system +
    "<</SYS>> " +
    instruction.instruction +
    " [/INST]\n",
};
