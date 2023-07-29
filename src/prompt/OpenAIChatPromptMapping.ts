import { OpenAIChatMessage } from "../model-provider/openai/chat/OpenAIChatMessage.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { PromptMapping } from "./PromptMapping.js";

export const OpenAIChatInstructionPromptMapping: PromptMapping<
  InstructionPrompt,
  Array<OpenAIChatMessage>
> = {
  map: (instruction) => {
    const messages: Array<OpenAIChatMessage> = [];

    if (instruction.system != null) {
      messages.push({
        role: "system",
        content: instruction.system,
      });
    }

    messages.push({
      role: "user",
      content: instruction.instruction,
    });

    return messages;
  },
  stopTokens: [],
};
