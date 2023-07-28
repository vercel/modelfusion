import { OpenAIChatMessage } from "index.js";

export interface PromptMapper<S, T> {
  map(source: S): T;
  stopTokens: string[];
}

export type Instruction = {
  system: string; // TODO optional
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

export const OpenAIChatPromptMapper: PromptMapper<
  Instruction,
  Array<OpenAIChatMessage>
> = {
  map: (instruction) => [
    {
      role: "system",
      content: instruction.system,
    },
    {
      role: "user",
      content: instruction.instruction,
    },
  ],
  stopTokens: [],
};
