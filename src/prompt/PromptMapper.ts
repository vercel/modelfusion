import { OpenAIChatMessage } from "../model-provider/openai/chat/OpenAIChatMessage.js";

export interface PromptMapper<S, T> {
  map(source: S): T;
  stopTokens: string[];
}

export type Instruction = {
  system: string; // TODO optional
  instruction: string;
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
