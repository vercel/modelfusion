import { GeneratorModel } from "../../../text/generate/GeneratorModel.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tiktoken.js";
import { OpenAITextCompletion } from "./OpenAITextCompletion.js";
import { generateOpenAITextCompletion } from "./generateOpenAITextCompletion.js";

export type OpenAITextModelType =
  | "text-davinci-003"
  | "text-davinci-002"
  | "code-davinci-002"
  | "text-curie-001"
  | "text-babbage-001"
  | "text-ada-001"
  | "davinci"
  | "curie"
  | "babbage"
  | "ada";

export type OpenAITextModelSettings = {
  isUserIdForwardingEnabled?: boolean;

  suffix?: string;
  maxCompletionTokens?: number;
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
    readonly maxTokens: number;
    readonly withSettings: (
      settings: OpenAITextModelSettings
    ) => OpenAITextModel;
  };

// see https://platform.openai.com/docs/models/
export const OpenAITextModelData: Record<
  OpenAITextModelType,
  {
    maxTokens: number;
  }
> = {
  "text-davinci-003": {
    maxTokens: 4096,
  },
  "text-davinci-002": {
    maxTokens: 4096,
  },
  "code-davinci-002": {
    maxTokens: 8000,
  },
  "text-curie-001": {
    maxTokens: 2048,
  },
  "text-babbage-001": {
    maxTokens: 2048,
  },
  "text-ada-001": {
    maxTokens: 2048,
  },
  davinci: {
    maxTokens: 2048,
  },
  curie: {
    maxTokens: 2048,
  },
  babbage: {
    maxTokens: 2048,
  },
  ada: {
    maxTokens: 2048,
  },
};

export const createOpenAITextModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAITextModelType;
  settings?: OpenAITextModelSettings;
}): OpenAITextModel => {
  const tokenizer = getTiktokenTokenizerForModel({ model });

  return {
    vendor: "openai",
    model,

    tokenizer,
    maxTokens: OpenAITextModelData[model].maxTokens,

    generate: async (input: string, context): Promise<OpenAITextCompletion> =>
      generateOpenAITextCompletion({
        baseUrl,
        abortSignal: context?.abortSignal,
        apiKey,
        prompt: input,
        model,
        suffix: settings.suffix,
        maxCompletionTokens: settings.maxCompletionTokens,
        temperature: settings.temperature,
        topP: settings.topP,
        n: settings.n,
        logprobs: settings.logprobs,
        echo: settings.echo,
        stop: settings.stop,
        presencePenalty: settings.presencePenalty,
        frequencyPenalty: settings.frequencyPenalty,
        bestOf: settings.bestOf,
        user: settings.isUserIdForwardingEnabled ? context?.userId : undefined,
      }),

    extractOutput: async (rawOutput: OpenAITextCompletion): Promise<string> => {
      return rawOutput.choices[0]!.text;
    },

    withSettings: (additionalSettings: OpenAITextModelSettings) =>
      createOpenAITextModel({
        baseUrl,
        apiKey,
        model,
        settings: Object.assign({}, settings, additionalSettings),
      }),
  };
};
