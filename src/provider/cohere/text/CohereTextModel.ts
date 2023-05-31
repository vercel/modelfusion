import { GenerateModel } from "../../../text/generate/GenerateModel.js";
import { CohereTextCompletion } from "./CohereTextCompletion.js";
import { generateCohereTextCompletion } from "./generateCohereTextCompletion.js";

export const COHERE_TEXT_MODELS = {
  command: {
    maxTokens: 2048,
  },
  "command-nightly": {
    maxTokens: 2048,
  },
  "command-light": {
    maxTokens: 2048,
  },
  "command-light-nightly": {
    maxTokens: 2048,
  },
};

export type CohereTextModelType = keyof typeof COHERE_TEXT_MODELS;

export type CohereTextModelSettings = {
  numGenerations?: number;
  maxCompletionTokens?: number;
  temperature?: number;
  k?: number;
  p?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  endSequences?: string[];
  stopSequences?: string[];
  returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
  logitBias?: Record<string, number>;
  truncate?: "NONE" | "START" | "END";
};

export type CohereTextModel = GenerateModel<
  string,
  CohereTextCompletion,
  string
> & {
  /**
   * Maximum number of prompt and completion tokens that this model supports.
   */
  readonly maxTokens: number;

  readonly withSettings: (settings: CohereTextModelSettings) => CohereTextModel;
};

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const textModel = createCohereTextModel({
 *   apiKey: COHERE_API_KEY,
 *   model: "command-nightly",
 *   settings: { temperature: 0.7 },
 * });
 *
 * const response = await textModel
 *   .withSettings({ maxCompletionTokens: 500 })
 *   .generate("Write a short story about a robot learning to love:\n\n");
 *
 * const text = await textModel.extractOutput(response);
 */
export const createCohereTextModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: CohereTextModelType;
  settings?: CohereTextModelSettings;
}): CohereTextModel => {
  return {
    vendor: "cohere",
    model,

    maxTokens: COHERE_TEXT_MODELS[model].maxTokens,

    generate: async (input: string, context): Promise<CohereTextCompletion> =>
      generateCohereTextCompletion({
        baseUrl,
        abortSignal: context?.abortSignal,
        apiKey,
        prompt: input,
        model,
        ...settings,
      }),

    extractOutput: async (rawOutput: CohereTextCompletion): Promise<string> => {
      return rawOutput.generations[0].text;
    },

    withSettings: (additionalSettings: CohereTextModelSettings) =>
      createCohereTextModel({
        baseUrl,
        apiKey,
        model,
        settings: Object.assign({}, settings, additionalSettings),
      }),
  };
};
