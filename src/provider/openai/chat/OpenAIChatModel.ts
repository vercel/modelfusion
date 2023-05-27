import { GeneratorModel } from "../../../text/generate/GeneratorModel.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tiktoken.js";
import {
  OpenAIChatCompletion,
  OpenAIChatMessage,
} from "./OpenAIChatCompletion.js";
import { generateOpenAIChatCompletion } from "./generateOpenAIChatCompletion.js";

export type OpenAIChatModelType =
  | "gpt-4"
  | "gpt-4-0314"
  | "gpt-4-32k"
  | "gpt-4-32k-0314"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301";

// see https://platform.openai.com/docs/models/
export const OpenAIChatModelData: Record<
  OpenAIChatModelType,
  {
    maxTokens: number;
  }
> = {
  "gpt-4": {
    maxTokens: 8192,
  },
  "gpt-4-0314": {
    maxTokens: 8192,
  },
  "gpt-4-32k": {
    maxTokens: 32768,
  },
  "gpt-4-32k-0314": {
    maxTokens: 32768,
  },
  "gpt-3.5-turbo": {
    maxTokens: 4096,
  },
  "gpt-3.5-turbo-0301": {
    maxTokens: 4096,
  },
};

export type OpenAIChatModelSettings = {
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxCompletionTokens?: number;
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
    readonly maxTokens: number;
    readonly withSettings: (
      settings: OpenAIChatModelSettings
    ) => OpenAIChatModel;
  };

export const createOpenAIChatModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAIChatModelType;
  settings?: OpenAIChatModelSettings;
}): OpenAIChatModel => ({
  vendor: "openai",
  model,

  tokenizer: getTiktokenTokenizerForModel({ model }),
  maxTokens: OpenAIChatModelData[model].maxTokens,

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
      maxCompletionTokens: settings.maxCompletionTokens,
      presencePenalty: settings.presencePenalty,
      frequencyPenalty: settings.frequencyPenalty,
    }),

  extractOutput: async (rawOutput: OpenAIChatCompletion): Promise<string> => {
    return rawOutput.choices[0]!.message.content;
  },

  withSettings: (additionalSettings: OpenAIChatModelSettings) =>
    createOpenAIChatModel({
      baseUrl,
      apiKey,
      model,
      settings: Object.assign({}, settings, additionalSettings),
    }),
});
