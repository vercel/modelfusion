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
import { PromptMapping } from "./PromptMapping.js";

export class PromptMappingTextGenerationAndStreamingModel<
    PROMPT,
    MODEL_PROMPT,
    RESPONSE,
    FULL_DELTA,
    SETTINGS extends TextStreamingModelSettings & TextGenerationModelSettings,
    MODEL extends TextGenerationModel<MODEL_PROMPT, RESPONSE, SETTINGS> &
      TextStreamingModel<MODEL_PROMPT, FULL_DELTA, SETTINGS>,
  >
  implements
    TextStreamingModel<PROMPT, FULL_DELTA, SETTINGS>,
    TextGenerationModel<PROMPT, RESPONSE, SETTINGS>
{
  private readonly model: MODEL;
  private readonly promptMapping: PromptMapping<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptMapping,
  }: {
    model: MODEL;
    promptMapping: PromptMapping<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptMapping = promptMapping;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  get tokenizer(): MODEL["tokenizer"] {
    return this.model.tokenizer;
  }

  get contextWindowSize(): MODEL["contextWindowSize"] {
    return this.model.contextWindowSize;
  }

  get countPromptTokens(): MODEL["countPromptTokens"] extends undefined
    ? undefined
    : (prompt: PROMPT) => PromiseLike<number> {
    const basic = this.model.countPromptTokens;

    if (basic === undefined) {
      return undefined as MODEL["countPromptTokens"] extends undefined
        ? undefined
        : (prompt: PROMPT) => PromiseLike<number>;
    }

    return ((prompt: PROMPT) =>
      basic(
        this.promptMapping.map(prompt)
      )) as MODEL["countPromptTokens"] extends undefined
      ? undefined
      : (prompt: PROMPT) => PromiseLike<number>;
  }

  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE> {
    const mappedPrompt = this.promptMapping.map(prompt);
    return this.model.generateTextResponse(mappedPrompt, options);
  }

  extractText(response: RESPONSE): string {
    return this.model.extractText(response);
  }

  generateDeltaStreamResponse(
    prompt: PROMPT,
    options: FunctionOptions<SETTINGS>
  ): PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>> {
    const mappedPrompt = this.promptMapping.map(prompt);
    return this.model.generateDeltaStreamResponse(mappedPrompt, options);
  }

  extractTextDelta(response: FULL_DELTA): string | undefined {
    return this.model.extractTextDelta(response);
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptMappingTextGenerationAndStreamingModel({
      model: this.model.withSettings(additionalSettings),
      promptMapping: this.promptMapping,
    }) as this;
  }

  withMaxTokens(maxTokens: number): this {
    return new PromptMappingTextGenerationAndStreamingModel({
      model: this.model.withMaxTokens(maxTokens),
      promptMapping: this.promptMapping,
    }) as this;
  }
}
