import { GeneratorModel } from "../../../text/generate/GeneratorModel.js";
import {
  OpenAITextCompletion,
  OpenAITextCompletionModel,
} from "./OpenAITextCompletion.js";
import { generateOpenAITextCompletion } from "./generateOpenAITextCompletion.js";

export const openAITextModel = ({
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
}): GeneratorModel<string, OpenAITextCompletion, string> => ({
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
});
