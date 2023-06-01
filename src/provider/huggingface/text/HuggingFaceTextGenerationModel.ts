import { RunContext } from "../../../run/RunContext.js";
import { TextGenerationModel } from "../../../text/generate/TextGenerationModel.js";
import { HuggingFaceTextGenerationResponse } from "./HuggingFaceTextGenerationResponse.js";
import { generateHuggingFaceTextCompletion } from "./generateHuggingFaceTextCompletion.js";

export type HuggingFaceTextGenerationModelSettings = {
  topK?: number;
  topP?: number;
  temperature?: number;
  repetitionPenalty?: number;
  maxNewTokens?: number;
  maxTime?: number;
  numReturnSequences?: number;
  doSample?: boolean;
  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
};

/**
 * Create a text generation model that calls a Hugging Face Inference API Text Generation Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const textGenerationModel = new HuggingFaceTextGenerationModel({
 *   apiKey: HUGGINGFACE_API_KEY,
 *   model: "tiiuae/falcon-7b",
 *   settings: { temperature: 700 },
 * });
 *
 * const response = await textGenerationModel
 *   .withSettings({ maxNewTokens: 500 })
 *   .generate("Write a short story about a robot learning to love:\n\n");
 *
 * const text = await textGenerationModel.extractOutput(response);
 */
export class HuggingFaceTextGenerationModel
  implements
    TextGenerationModel<string, HuggingFaceTextGenerationResponse, string>
{
  readonly provider = "huggingface";

  readonly baseUrl?: string;
  readonly apiKey: string;

  readonly model: string;
  readonly settings: HuggingFaceTextGenerationModelSettings;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
  }: {
    baseUrl?: string;
    apiKey: string;
    model: string;
    settings?: HuggingFaceTextGenerationModelSettings;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    this.model = model;
    this.settings = settings;
  }

  async generate(
    input: string,
    context?: RunContext
  ): Promise<HuggingFaceTextGenerationResponse> {
    return generateHuggingFaceTextCompletion({
      baseUrl: this.baseUrl,
      abortSignal: context?.abortSignal,
      apiKey: this.apiKey,
      inputs: input,
      model: this.model,
      ...this.settings,
      options: this.settings.options ?? {
        useCache: true,
        waitForModel: true,
      },
    });
  }

  async extractOutput(
    rawOutput: HuggingFaceTextGenerationResponse
  ): Promise<string> {
    return rawOutput[0].generated_text;
  }

  withSettings(additionalSettings: HuggingFaceTextGenerationModelSettings) {
    return new HuggingFaceTextGenerationModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
    });
  }
}
