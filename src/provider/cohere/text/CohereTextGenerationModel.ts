import { RunContext } from "../../../run/RunContext.js";
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

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const textGenerationModel = new CohereTextGenerationModel({
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
export class CohereTextGenerationModel
  implements TextGenerationModel<string, CohereTextCompletion, string>
{
  readonly provider = "cohere";

  readonly baseUrl?: string;
  readonly apiKey: string;

  readonly model: CohereTextGenerationModelType;
  readonly settings: CohereTextGenerationModelSettings;

  readonly maxTokens: number;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
  }: {
    baseUrl?: string;
    apiKey: string;
    model: CohereTextGenerationModelType;
    settings?: CohereTextGenerationModelSettings;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    this.model = model;
    this.settings = settings;

    this.maxTokens = COHERE_TEXT_GENERATION_MODELS[model].maxTokens;
  }

  async generate(
    input: string,
    context?: RunContext
  ): Promise<CohereTextCompletion> {
    return generateCohereTextCompletion({
      baseUrl: this.baseUrl,
      abortSignal: context?.abortSignal,
      apiKey: this.apiKey,
      prompt: input,
      model: this.model,
      ...this.settings,
    });
  }

  async extractOutput(rawOutput: CohereTextCompletion): Promise<string> {
    return rawOutput.generations[0].text;
  }

  withSettings(additionalSettings: CohereTextGenerationModelSettings) {
    return new CohereTextGenerationModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
    });
  }
}
