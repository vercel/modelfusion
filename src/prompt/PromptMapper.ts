export interface PromptMapper<S, T> {
  map(source: S): T;
  stopTokens: string[];
}

export type Instruction = {
  system: string;
  instruction: string;
};

export const llamaInstructionMapper: PromptMapper<Instruction, string> = {
  map: (instruction) =>
    "<s>[INST] <<SYS>>" +
    instruction.system +
    "<</SYS>> " +
    instruction.instruction +
    " [/INST]\n",
  stopTokens: ["</s>"],
};
