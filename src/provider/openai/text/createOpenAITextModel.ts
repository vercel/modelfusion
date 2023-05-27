import { GeneratorModel } from "../../../text/generate/GeneratorModel.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tiktoken.js";
import {
  OpenAITextCompletion,
  OpenAITextCompletionModel,
} from "./OpenAITextCompletion.js";
import { generateOpenAITextCompletion } from "./generateOpenAITextCompletion.js";

export type OpenAITextModelSettings = {
  suffix?: string;
  maxGeneratedTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
};

export type OpenAITextModel = GeneratorModel<
  string,
  OpenAITextCompletion,
  string
> &
  TokenizerModel<number[]> & {
    maxTokens: number;

    withSettings: (settings: OpenAITextModelSettings) => OpenAITextModel;
  };

// see https://platform.openai.com/docs/models/
const maxTokensByModel: Record<OpenAITextCompletionModel, number> = {
  "text-davinci-003": 4097,
  "text-davinci-002": 4097,
  "code-davinci-002": 8001,
  "text-curie-001": 2049,
  "text-babbage-001": 2049,
  "text-ada-001": 2049,
  davinci: 2049,
  curie: 2049,
  babbage: 2049,
  ada: 2049,
};

export const createOpenAITextModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAITextCompletionModel;
  settings?: OpenAITextModelSettings;
}): OpenAITextModel => ({
  vendor: "openai",
  name: model,

  maxTokens: maxTokensByModel[model],

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
      suffix: settings.suffix,
      maxGeneratedTokens: settings.maxGeneratedTokens,
      temperature: settings.temperature,
      topP: settings.topP,
      n: settings.n,
      logprobs: settings.logprobs,
      echo: settings.echo,
      stop: settings.stop,
      presencePenalty: settings.presencePenalty,
      frequencyPenalty: settings.frequencyPenalty,
      bestOf: settings.bestOf,
    }),

  extractOutput: async (rawOutput: OpenAITextCompletion): Promise<string> => {
    return rawOutput.choices[0]!.text;
  },

  getTokenizer() {
    return getTiktokenTokenizerForModel({ model });
  },

  withSettings: (additionalSettings: OpenAITextModelSettings) =>
    createOpenAITextModel({
      baseUrl,
      apiKey,
      model,
      settings: Object.assign({}, settings, additionalSettings),
    }),
});
