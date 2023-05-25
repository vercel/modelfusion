import { GeneratorModel } from "../../text/generate/GeneratorModel.js";
import {
  OpenAIChatCompletion,
  OpenAIChatCompletionModel,
  OpenAIChatMessage,
  generateOpenAIChatCompletion,
} from "./index.js";

export const openAIChatModel = ({
  baseUrl,
  apiKey,
  model,
  temperature = 0,
  maxTokens,
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAIChatCompletionModel;
  temperature?: number;
  maxTokens?: number;
}): GeneratorModel<OpenAIChatMessage[], OpenAIChatCompletion, string> => ({
  vendor: "openai",
  name: model,
  generate: async (input, { abortSignal }): Promise<OpenAIChatCompletion> =>
    generateOpenAIChatCompletion({
      baseUrl,
      abortSignal,
      apiKey,
      messages: input,
      model,
      temperature,
      maxTokens,
    }),
  extractOutput: async (rawOutput: OpenAIChatCompletion): Promise<string> => {
    return rawOutput.choices[0]!.message.content;
  },
});
