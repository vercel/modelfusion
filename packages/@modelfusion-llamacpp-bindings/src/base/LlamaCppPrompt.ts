import {
  LlamaCppCompletionPrompt,
  TextGenerationPromptTemplate,
  TextGenerationPromptTemplateProvider,
  MistralInstructPrompt,
  ChatMLPrompt,
  Llama2Prompt,
  NeuralChatPrompt,
  AlpacaPrompt,
  SynthiaPrompt,
  VicunaPrompt,
  TextPrompt,
} from "modelfusion";

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

export const Text = asLlamaCppTextPromptTemplateProvider(TextPrompt);

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
export const Mistral = asLlamaCppTextPromptTemplateProvider(
  MistralInstructPrompt
);

export const ChatML = asLlamaCppTextPromptTemplateProvider(ChatMLPrompt);
export const Llama2 = asLlamaCppTextPromptTemplateProvider(Llama2Prompt);
export const NeuralChat =
  asLlamaCppTextPromptTemplateProvider(NeuralChatPrompt);
export const Alpaca = asLlamaCppTextPromptTemplateProvider(AlpacaPrompt);
export const Synthia = asLlamaCppTextPromptTemplateProvider(SynthiaPrompt);
export const Vicuna = asLlamaCppTextPromptTemplateProvider(VicunaPrompt);
