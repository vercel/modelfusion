import { FunctionOptions } from "../../core/FunctionOptions.js";
import {
  TextGenerationToolCallModel,
  ToolCallPromptFormat,
} from "../../tool/generate-tool-call/TextGenerationToolCallModel.js";
import {
  TextGenerationToolCallsOrGenerateTextModel,
  ToolCallsOrGenerateTextPromptFormat,
} from "../../tool/generate-tool-calls-or-text/TextGenerationToolCallsOrGenerateTextModel.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";
import { TextGenerationPromptFormat } from "./TextGenerationPromptFormat.js";

export class PromptFormatTextGenerationModel<
  PROMPT,
  MODEL_PROMPT,
  SETTINGS extends TextGenerationModelSettings,
  MODEL extends TextGenerationModel<MODEL_PROMPT, SETTINGS>,
> implements TextGenerationModel<PROMPT, SETTINGS>
{
  readonly model: MODEL;
  readonly promptFormat: TextGenerationPromptFormat<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptFormat,
  }: {
    model: MODEL;
    promptFormat: TextGenerationPromptFormat<PROMPT, MODEL_PROMPT>;
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

  doGenerateText(prompt: PROMPT, options?: FunctionOptions) {
    const mappedPrompt = this.promptFormat.format(prompt);
    return this.model.doGenerateText(mappedPrompt, options);
  }

  get settingsForEvent(): Partial<SETTINGS> {
    return this.model.settingsForEvent;
  }

  asToolCallGenerationModel<INPUT_PROMPT>(
    promptFormat: ToolCallPromptFormat<INPUT_PROMPT, PROMPT>
  ) {
    return new TextGenerationToolCallModel({
      model: this,
      format: promptFormat,
    });
  }

  asToolCallsOrTextGenerationModel<INPUT_PROMPT>(
    promptFormat: ToolCallsOrGenerateTextPromptFormat<INPUT_PROMPT, PROMPT>
  ) {
    return new TextGenerationToolCallsOrGenerateTextModel({
      model: this,
      format: promptFormat,
    });
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, PROMPT>
  ): PromptFormatTextGenerationModel<INPUT_PROMPT, PROMPT, SETTINGS, this> {
    return new PromptFormatTextGenerationModel<
      INPUT_PROMPT,
      PROMPT,
      SETTINGS,
      this
    >({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptFormat.stopSequences,
        ],
      } as Partial<SETTINGS>),
      promptFormat,
    });
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptFormatTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptFormat: this.promptFormat,
    }) as this;
  }
}
