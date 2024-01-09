import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import * as alpacaPrompt from "../../model-function/generate-text/prompt-template/AlpacaPromptTemplate.js";
import * as chatMlPrompt from "../../model-function/generate-text/prompt-template/ChatMLPromptTemplate.js";
import * as llama2Prompt from "../../model-function/generate-text/prompt-template/Llama2PromptTemplate.js";
import * as mistralPrompt from "../../model-function/generate-text/prompt-template/MistralInstructPromptTemplate.js";
import * as neuralChatPrompt from "../../model-function/generate-text/prompt-template/NeuralChatPromptTemplate.js";
import { TextGenerationPromptTemplateProvider } from "../../model-function/generate-text/prompt-template/PromptTemplateProvider.js";
import * as textPrompt from "../../model-function/generate-text/prompt-template/TextPromptTemplate.js";
import * as vicunaPrompt from "../../model-function/generate-text/prompt-template/VicunaPromptTemplate.js";
import { OllamaCompletionPrompt } from "./OllamaCompletionModel.js";

export function asOllamaCompletionPromptTemplate<SOURCE_PROMPT>(
  promptTemplate: TextGenerationPromptTemplate<SOURCE_PROMPT, string>
): TextGenerationPromptTemplate<SOURCE_PROMPT, OllamaCompletionPrompt> {
  return {
    format: (prompt) => ({
      prompt: promptTemplate.format(prompt),
    }),
    stopSequences: promptTemplate.stopSequences,
  };
}

export function asOllamaCompletionTextPromptTemplateProvider(
  promptTemplateProvider: TextGenerationPromptTemplateProvider<string>
): TextGenerationPromptTemplateProvider<OllamaCompletionPrompt> {
  return {
    text: () => asOllamaCompletionPromptTemplate(promptTemplateProvider.text()),

    instruction: () =>
      asOllamaCompletionPromptTemplate(promptTemplateProvider.instruction()),

    chat: () => asOllamaCompletionPromptTemplate(promptTemplateProvider.chat()),
  };
}

export const Text = asOllamaCompletionTextPromptTemplateProvider(textPrompt);
export const Mistral =
  asOllamaCompletionTextPromptTemplateProvider(mistralPrompt);
export const ChatML =
  asOllamaCompletionTextPromptTemplateProvider(chatMlPrompt);
export const Llama2 =
  asOllamaCompletionTextPromptTemplateProvider(llama2Prompt);
export const NeuralChat =
  asOllamaCompletionTextPromptTemplateProvider(neuralChatPrompt);
export const Alpaca =
  asOllamaCompletionTextPromptTemplateProvider(alpacaPrompt);
export const Vicuna =
  asOllamaCompletionTextPromptTemplateProvider(vicunaPrompt);
