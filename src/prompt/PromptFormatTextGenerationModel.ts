import { FunctionOptions } from "../model-function/FunctionOptions.js";
import { DeltaEvent } from "../model-function/generate-text/DeltaEvent.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../model-function/generate-text/TextGenerationModel.js";
import { PromptFormat } from "./PromptFormat.js";

export class PromptFormatTextGenerationModel<
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
  private readonly promptFormat: PromptFormat<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptFormat,
  }: {
    model: MODEL;
    promptFormat: PromptFormat<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptFormat = promptFormat;
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
    const originalCountPromptTokens = this.model.countPromptTokens?.bind(
      this.model
    );

    if (originalCountPromptTokens === undefined) {
      return undefined as MODEL["countPromptTokens"] extends undefined
        ? undefined
        : (prompt: PROMPT) => PromiseLike<number>;
    }

    return ((prompt: PROMPT) =>
      originalCountPromptTokens(
        this.promptFormat.format(prompt)
      )) as MODEL["countPromptTokens"] extends undefined
      ? undefined
      : (prompt: PROMPT) => PromiseLike<number>;
  }

  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE> {
    const mappedPrompt = this.promptFormat.format(prompt);
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
      this.model.generateDeltaStreamResponse?.bind(this.model);

    if (originalGenerateDeltaStreamResponse === undefined) {
      return undefined as MODEL["generateDeltaStreamResponse"] extends undefined
        ? undefined
        : (
            prompt: PROMPT,
            options: FunctionOptions<SETTINGS>
          ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
    }

    return ((prompt: PROMPT, options: FunctionOptions<SETTINGS>) => {
      const mappedPrompt = this.promptFormat.format(prompt);
      return originalGenerateDeltaStreamResponse(mappedPrompt, options);
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

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, PROMPT>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    PROMPT,
    RESPONSE,
    FULL_DELTA,
    SETTINGS,
    this
  > {
    return new PromptFormatTextGenerationModel<
      INPUT_PROMPT,
      PROMPT,
      RESPONSE,
      FULL_DELTA,
      SETTINGS,
      this
    >({
      model: this.withStopTokens(promptFormat.stopTokens),
      promptFormat,
    });
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptFormatTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptFormat: this.promptFormat,
    }) as this;
  }

  get maxCompletionTokens(): MODEL["maxCompletionTokens"] {
    return this.model.maxCompletionTokens;
  }

  withMaxCompletionTokens(maxCompletionTokens: number): this {
    return new PromptFormatTextGenerationModel({
      model: this.model.withMaxCompletionTokens(maxCompletionTokens),
      promptFormat: this.promptFormat,
    }) as this;
  }

  withStopTokens(stopTokens: string[]): this {
    return new PromptFormatTextGenerationModel({
      model: this.model.withStopTokens(stopTokens),
      promptFormat: this.promptFormat,
    }) as this;
  }
}
