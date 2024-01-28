import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate";
import { ChatPrompt } from "./ChatPrompt";
import { InstructionPrompt } from "./InstructionPrompt";

export interface TextGenerationPromptTemplateProvider<TARGET_PROMPT> {
  text(): TextGenerationPromptTemplate<string, TARGET_PROMPT>;
  instruction(): TextGenerationPromptTemplate<InstructionPrompt, TARGET_PROMPT>;
  chat(): TextGenerationPromptTemplate<ChatPrompt, TARGET_PROMPT>;
}
