import { getTiktokenTokenizerForModel } from "../tiktoken.js";
import { OpenAITextModelType } from "./OpenAITextCompletion.js";

export async function countOpenAITextPromptTokens({
  prompt,
  model,
}: {
  prompt: string;
  model: OpenAITextModelType;
}) {
  return await getTiktokenTokenizerForModel({ model }).countTokens(prompt);
}
