import { TextGenerationModel } from "../../../text/generate/TextGenerationModel.js";
import { CohereTextCompletion } from "./CohereTextCompletion.js";
import { generateCohereTextCompletion } from "./generateCohereTextCompletion.js";

export const COHERE_TEXT_GENERATION_MODELS = {
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

export type CohereTextGenerationModelType =
  keyof typeof COHERE_TEXT_GENERATION_MODELS;

export type CohereTextGenerationModelSettings = {
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

export type CohereTextGenerationModel = TextGenerationModel<
  string,
  CohereTextCompletion,
  string
> & {
  /**
   * Maximum number of prompt and completion tokens that this model supports.
   */
  readonly maxTokens: number;

  readonly withSettings: (
    settings: CohereTextGenerationModelSettings
  ) => CohereTextGenerationModel;
};

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const textGenerationModel = createCohereTextGenerationModel({
 *   apiKey: COHERE_API_KEY,
 *   model: "command-nightly",
 *   settings: { temperature: 0.7 },
 * });
 *
 * const response = await textGenerationModel
 *   .withSettings({ maxCompletionTokens: 500 })
 *   .generate("Write a short story about a robot learning to love:\n\n");
 *
 * const text = await textGenerationModel.extractOutput(response);
 */
export const createCohereTextGenerationModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: CohereTextGenerationModelType;
  settings?: CohereTextGenerationModelSettings;
}): CohereTextGenerationModel => {
  return {
    provider: "cohere",
    model,

    maxTokens: COHERE_TEXT_GENERATION_MODELS[model].maxTokens,

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

    withSettings: (additionalSettings: CohereTextGenerationModelSettings) =>
      createCohereTextGenerationModel({
        baseUrl,
        apiKey,
        model,
        settings: Object.assign({}, settings, additionalSettings),
      }),
  };
};
