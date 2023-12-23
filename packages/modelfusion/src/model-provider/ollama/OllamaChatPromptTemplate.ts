import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { ChatPrompt } from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { Content } from "../../model-function/generate-text/prompt-template/Content.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { OllamaChatPrompt } from "./OllamaChatModel.js";

/**
 * OllamaChatPrompt identity chat format.
 */
export function identity(): TextGenerationPromptTemplate<
  OllamaChatPrompt,
  OllamaChatPrompt
> {
  return { format: (prompt) => prompt, stopSequences: [] };
}

/**
 * Formats a text prompt as an Ollama chat prompt.
 */
export function text(): TextGenerationPromptTemplate<string, OllamaChatPrompt> {
  return {
    format: (prompt) => [{ role: "user", content: prompt }],
    stopSequences: [],
  };
}

/**
 * Formats an instruction prompt as an Ollama chat prompt.
 */
export function instruction(): TextGenerationPromptTemplate<
  InstructionPrompt,
  OllamaChatPrompt
> {
  return {
    format(prompt) {
      const messages: OllamaChatPrompt = [];

      if (prompt.system != null) {
        messages.push({ role: "system", content: prompt.system });
      }

      messages.push({ role: "user", ...extractContent(prompt.instruction) });

      return messages;
    },
    stopSequences: [],
  };
}

/**
 * Formats a chat prompt as an Ollama chat prompt.
 */
export function chat(): TextGenerationPromptTemplate<
  ChatPrompt,
  OllamaChatPrompt
> {
  return {
    format(prompt) {
      const messages: OllamaChatPrompt = [];

      if (prompt.system != null) {
        messages.push({ role: "system", content: prompt.system });
      }

      for (const { role, content } of prompt.messages) {
        messages.push({ role, ...extractContent(content) });
      }

      return messages;
    },
    stopSequences: [],
  };
}

function extractContent(input: Content) {
  if (typeof input === "string") {
    return { content: input, images: undefined };
  }

  const images: string[] = [];
  let content = "";

  for (const part of input) {
    if (part.type === "text") {
      content += part.text;
    } else {
      images.push(part.base64Image);
    }
  }

  return { content, images };
}
