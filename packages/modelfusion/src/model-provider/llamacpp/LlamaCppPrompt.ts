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
import * as LlamaCppBakLLaVA1Prompt from "./LlamaCppBakLLaVA1PromptTemplate.js";
import { LlamaCppCompletionPrompt } from "./LlamaCppCompletionModel.js";

export function asLlamaCppPromptTemplate<SOURCE_PROMPT>(
  promptTemplate: TextGenerationPromptTemplate<SOURCE_PROMPT, string>
): TextGenerationPromptTemplate<SOURCE_PROMPT, LlamaCppCompletionPrompt> {
  return {
    format: (prompt) => ({
      text: promptTemplate.format(prompt),
    }),
    stopSequences: promptTemplate.stopSequences,
  };
}

export function asLlamaCppTextPromptTemplateProvider(
  promptTemplateProvider: TextGenerationPromptTemplateProvider<string>
): TextGenerationPromptTemplateProvider<LlamaCppCompletionPrompt> {
  return {
    text: () => asLlamaCppPromptTemplate(promptTemplateProvider.text()),

    instruction: () =>
      asLlamaCppPromptTemplate(promptTemplateProvider.instruction()),

    chat: () => asLlamaCppPromptTemplate(promptTemplateProvider.chat()),
  };
}

export const Text = asLlamaCppTextPromptTemplateProvider(textPrompt);

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
export const Mistral = asLlamaCppTextPromptTemplateProvider(mistralPrompt);

export const ChatML = asLlamaCppTextPromptTemplateProvider(chatMlPrompt);
export const Llama2 = asLlamaCppTextPromptTemplateProvider(llama2Prompt);
export const NeuralChat =
  asLlamaCppTextPromptTemplateProvider(neuralChatPrompt);
export const Alpaca = asLlamaCppTextPromptTemplateProvider(alpacaPrompt);
export const Synthia = asLlamaCppTextPromptTemplateProvider(synthiaPrompt);
export const Vicuna = asLlamaCppTextPromptTemplateProvider(vicunaPrompt);
export const BakLLaVA1 = LlamaCppBakLLaVA1Prompt;
