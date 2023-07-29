import { FunctionOptions } from "../model-function/FunctionOptions.js";
import { DeltaEvent } from "../model-function/stream-text/DeltaEvent.js";
import {
  TextStreamingModel,
  TextStreamingModelSettings,
} from "../model-function/stream-text/TextStreamingModel.js";
import { PromptMapper } from "./PromptMapper.js";

export class PromptMappedTextStreamingModel<
  PROMPT,
  MODEL_PROMPT,
  FULL_DELTA,
  SETTINGS extends TextStreamingModelSettings,
> implements TextStreamingModel<PROMPT, FULL_DELTA, SETTINGS>
{
  private readonly model: TextStreamingModel<
    MODEL_PROMPT,
    FULL_DELTA,
    SETTINGS
  >;
  private readonly promptMapper: PromptMapper<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptMapper,
  }: {
    model: TextStreamingModel<MODEL_PROMPT, FULL_DELTA, SETTINGS>;
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
    return new PromptMappedTextStreamingModel({
      model: this.model.withSettings(additionalSettings),
      promptMapper: this.promptMapper,
    }) as this;
  }
}
