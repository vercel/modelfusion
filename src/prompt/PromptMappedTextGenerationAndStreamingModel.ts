import { FunctionOptions } from "../model-function/FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../model-function/generate-text/TextGenerationModel.js";
import { DeltaEvent } from "../model-function/stream-text/DeltaEvent.js";
import {
  TextStreamingModel,
  TextStreamingModelSettings,
} from "../model-function/stream-text/TextStreamingModel.js";
import { PromptMapper } from "./PromptMapper.js";

export class PromptMappedTextGenerationAndStreamingModel<
    PROMPT,
    MODEL_PROMPT,
    FULL_DELTA,
    RESPONSE,
    SETTINGS extends TextStreamingModelSettings & TextGenerationModelSettings,
  >
  implements
    TextStreamingModel<PROMPT, FULL_DELTA, SETTINGS>,
    TextGenerationModel<PROMPT, RESPONSE, SETTINGS>
{
  private readonly model: TextGenerationModel<
    MODEL_PROMPT,
    RESPONSE,
    SETTINGS
  > &
    TextStreamingModel<MODEL_PROMPT, FULL_DELTA, SETTINGS>;
  private readonly promptMapper: PromptMapper<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptMapper,
  }: {
    model: TextGenerationModel<MODEL_PROMPT, RESPONSE, SETTINGS> &
      TextStreamingModel<MODEL_PROMPT, FULL_DELTA, SETTINGS>;
    promptMapper: PromptMapper<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptMapper = promptMapper;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE> {
    const mappedPrompt = this.promptMapper.map(prompt);
    return this.model.generateTextResponse(mappedPrompt, options);
  }

  extractText(response: RESPONSE): string {
    return this.model.extractText(response);
  }

  generateDeltaStreamResponse(
    prompt: PROMPT,
    options: FunctionOptions<SETTINGS>
  ): PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>> {
    const mappedPrompt = this.promptMapper.map(prompt);
    return this.model.generateDeltaStreamResponse(mappedPrompt, options);
  }

  extractTextDelta(response: FULL_DELTA): string | undefined {
    return this.model.extractTextDelta(response);
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptMappedTextGenerationAndStreamingModel({
      model: this.model.withSettings(additionalSettings),
      promptMapper: this.promptMapper,
    }) as this;
  }
}
