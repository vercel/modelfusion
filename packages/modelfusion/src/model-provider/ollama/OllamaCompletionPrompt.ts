import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import * as alpacaPrompt from "../../model-function/generate-text/prompt-template/AlpacaPromptTemplate.js";
import * as chatMlPrompt from "../../model-function/generate-text/prompt-template/ChatMLPromptTemplate.js";
import * as llama2Prompt from "../../model-function/generate-text/prompt-template/Llama2PromptTemplate.js";
import * as mistralPrompt from "../../model-function/generate-text/prompt-template/MistralInstructPromptTemplate.js";
import * as neuralChatPrompt from "../../model-function/generate-text/prompt-template/NeuralChatPromptTemplate.js";
import { TextGenerationPromptTemplateProvider } from "../../model-function/generate-text/prompt-template/PromptTemplateProvider.js";
import * as synthiaPrompt from "../../model-function/generate-text/prompt-template/SynthiaPromptTemplate.js";
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

/**
 * Formats text, instruction or chat prompts as a Mistral instruct prompt.
 *
 * Note that Mistral does not support system prompts. We emulate them.
 *
 * Text prompt:
 * ```
 * <s>[INST] { instruction } [/INST]
 * ```
 *
 * Instruction prompt when system prompt is set:
 * ```
 * <s>[INST] ${ system prompt } [/INST] </s>[INST] ${instruction} [/INST] ${ response prefix }
 * ```
 *
 * Instruction prompt template when there is no system prompt:
 * ```
 * <s>[INST] ${ instruction } [/INST] ${ response prefix }
 * ```
 *
 * Chat prompt when system prompt is set:
 * ```
 * <s>[INST] ${ system prompt } [/INST] </s> [INST] ${ user msg 1 } [/INST] ${ model response 1 } [INST] ${ user msg 2 } [/INST] ${ model response 2 } [INST] ${ user msg 3 } [/INST]
 * ```
 *
 * Chat prompt when there is no system prompt:
 * ```
 * <s>[INST] ${ user msg 1 } [/INST] ${ model response 1 } </s>[INST] ${ user msg 2 } [/INST] ${ model response 2 } [INST] ${ user msg 3 } [/INST]
 * ```
 *
 * @see https://docs.mistral.ai/models/#chat-template
 */
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
export const Synthia =
  asOllamaCompletionTextPromptTemplateProvider(synthiaPrompt);
export const Vicuna =
  asOllamaCompletionTextPromptTemplateProvider(vicunaPrompt);
