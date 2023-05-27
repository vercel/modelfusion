import { GeneratorModel } from "../../../text/generate/GeneratorModel.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tiktoken.js";
import {
  OpenAIChatCompletion,
  OpenAIChatCompletionModel,
  OpenAIChatMessage,
} from "./OpenAIChatCompletion.js";
import { generateOpenAIChatCompletion } from "./generateOpenAIChatCompletion.js";

export type OpenAIChatModelSettings = {
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxGeneratedTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  user?: string;
};

export type OpenAIChatModel = GeneratorModel<
  OpenAIChatMessage[],
  OpenAIChatCompletion,
  string
> &
  TokenizerModel<number[]> & {
    maxTokens: number;
    withSettings: (settings: OpenAIChatModelSettings) => OpenAIChatModel;
  };

// see https://platform.openai.com/docs/models/
const maxTokensByModel: Record<OpenAIChatCompletionModel, number> = {
  "gpt-4": 8192,
  "gpt-4-0314": 8192,
  "gpt-4-32k": 32768,
  "gpt-4-32k-0314": 32768,
  "gpt-3.5-turbo": 4096,
  "gpt-3.5-turbo-0301": 4096,
};

export const createOpenAIChatModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAIChatCompletionModel;
  settings?: OpenAIChatModelSettings;
}): OpenAIChatModel => ({
  vendor: "openai",
  name: model,

  maxTokens: maxTokensByModel[model],

  generate: async (input, { abortSignal }): Promise<OpenAIChatCompletion> =>
    generateOpenAIChatCompletion({
      baseUrl,
      abortSignal,
      apiKey,
      messages: input,
      model,
      temperature: settings.temperature,
      topP: settings.topP,
      n: settings.n,
      stop: settings.stop,
      maxGeneratedTokens: settings.maxGeneratedTokens,
      presencePenalty: settings.presencePenalty,
      frequencyPenalty: settings.frequencyPenalty,
    }),

  extractOutput: async (rawOutput: OpenAIChatCompletion): Promise<string> => {
    return rawOutput.choices[0]!.message.content;
  },

  getTokenizer() {
    return getTiktokenTokenizerForModel({ model });
  },

  withSettings: (additionalSettings: OpenAIChatModelSettings) =>
    createOpenAIChatModel({
      baseUrl,
      apiKey,
      model,
      settings: Object.assign({}, settings, additionalSettings),
    }),
});
