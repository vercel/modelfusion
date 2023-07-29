import { FunctionOptions } from "../model-function/FunctionOptions.js";
import { DeltaEvent } from "../model-function/generate-text/DeltaEvent.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../model-function/generate-text/TextGenerationModel.js";
import { PromptMapping } from "./PromptMapping.js";

export class PromptMappingTextGenerationModel<
  PROMPT,
  MODEL_PROMPT,
  RESPONSE,
  FULL_DELTA,
  SETTINGS extends TextGenerationModelSettings,
  MODEL extends TextGenerationModel<
    MODEL_PROMPT,
    RESPONSE,
    FULL_DELTA,
    SETTINGS
  >,
> implements TextGenerationModel<PROMPT, RESPONSE, FULL_DELTA, SETTINGS>
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
    const originalCountPromptTokens = this.model.countPromptTokens;

    if (originalCountPromptTokens === undefined) {
      return undefined as MODEL["countPromptTokens"] extends undefined
        ? undefined
        : (prompt: PROMPT) => PromiseLike<number>;
    }

    return ((prompt: PROMPT) =>
      originalCountPromptTokens(
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

  get generateDeltaStreamResponse(): MODEL["generateDeltaStreamResponse"] extends undefined
    ? undefined
    : (
        prompt: PROMPT,
        options: FunctionOptions<SETTINGS>
      ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>> {
    const originalGenerateDeltaStreamResponse =
      this.model.generateDeltaStreamResponse;

    if (originalGenerateDeltaStreamResponse === undefined) {
      return undefined as MODEL["generateDeltaStreamResponse"] extends undefined
        ? undefined
        : (
            prompt: PROMPT,
            options: FunctionOptions<SETTINGS>
          ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
    }

    return ((prompt: PROMPT, options: FunctionOptions<SETTINGS>) => {
      const mappedPrompt = this.promptMapping.map(prompt);
      return originalGenerateDeltaStreamResponse.bind(this.model)(
        mappedPrompt,
        options
      );
    }) as MODEL["generateDeltaStreamResponse"] extends undefined
      ? undefined
      : (
          prompt: PROMPT,
          options: FunctionOptions<SETTINGS>
        ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
  }

  get extractTextDelta(): MODEL["extractTextDelta"] {
    return this.model.extractTextDelta;
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptMappingTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptMapping: this.promptMapping,
    }) as this;
  }

  withMaxTokens(maxTokens: number): this {
    return new PromptMappingTextGenerationModel({
      model: this.model.withMaxTokens(maxTokens),
      promptMapping: this.promptMapping,
    }) as this;
  }

  withStopTokens(stopTokens: string[]): this {
    return new PromptMappingTextGenerationModel({
      model: this.model.withStopTokens(stopTokens),
      promptMapping: this.promptMapping,
    }) as this;
  }
}
