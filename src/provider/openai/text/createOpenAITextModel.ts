import { GeneratorModel } from "../../../text/generate/GeneratorModel.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tiktoken.js";
import {
  OpenAITextCompletion,
  OpenAITextCompletionModel,
} from "./OpenAITextCompletion.js";
import { generateOpenAITextCompletion } from "./generateOpenAITextCompletion.js";

export type OpenAITextModel = GeneratorModel<
  string,
  OpenAITextCompletion,
  string
> &
  TokenizerModel<number[]>;

export const createOpenAITextModel = ({
  baseUrl,
  apiKey,
  model,
  temperature = 0,
  maxTokens,
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAITextCompletionModel;
  temperature?: number;
  maxTokens?: number;
}): OpenAITextModel => ({
  vendor: "openai",
  name: model,

  generate: async (
    input: string,
    { abortSignal }
  ): Promise<OpenAITextCompletion> =>
    generateOpenAITextCompletion({
      baseUrl,
      abortSignal,
      apiKey,
      prompt: input,
      model,
      temperature,
      maxTokens,
    }),
  extractOutput: async (rawOutput: OpenAITextCompletion): Promise<string> => {
    return rawOutput.choices[0]!.text;
  },

  getTokenizer() {
    return getTiktokenTokenizerForModel({ model });
  },
});
