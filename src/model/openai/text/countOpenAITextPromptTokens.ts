import { getTiktokenTokenizerForModel } from "../tokenizer/tiktoken.js";
import { OpenAITextModelType } from "./OpenAITextModel.js";

export async function countOpenAITextPromptTokens({
  prompt,
  model,
}: {
  prompt: string;
  model: OpenAITextModelType;
}) {
  return await getTiktokenTokenizerForModel({ model }).countTokens(prompt);
}
