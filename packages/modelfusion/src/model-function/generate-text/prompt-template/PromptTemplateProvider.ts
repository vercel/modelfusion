import { TextGenerationPromptTemplate } from "../TextGenerationPromptTemplate.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { InstructionPrompt } from "./InstructionPrompt.js";

export interface TextGenerationPromptTemplateProvider<TARGET_PROMPT> {
  text(): TextGenerationPromptTemplate<string, TARGET_PROMPT>;
  instruction(): TextGenerationPromptTemplate<InstructionPrompt, TARGET_PROMPT>;
  chat(): TextGenerationPromptTemplate<ChatPrompt, TARGET_PROMPT>;
}
