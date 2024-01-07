import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import {
  TextGenerationToolCallModel,
  ToolCallPromptTemplate,
} from "../../tool/generate-tool-call/TextGenerationToolCallModel.js";
import { TextGenerationToolCallsModel } from "../../tool/generate-tool-calls/TextGenerationToolCallsModel.js";
import { ToolCallsPromptTemplate } from "../../tool/generate-tool-calls/ToolCallsPromptTemplate.js";
import { StructureFromTextGenerationModel } from "../generate-structure/StructureFromTextGenerationModel.js";
import { StructureFromTextPromptTemplate } from "../generate-structure/StructureFromTextPromptTemplate.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate.js";

export class PromptTemplateTextGenerationModel<
  PROMPT,
  MODEL_PROMPT,
  SETTINGS extends TextGenerationModelSettings,
  MODEL extends TextGenerationModel<MODEL_PROMPT, SETTINGS>,
> implements TextGenerationModel<PROMPT, SETTINGS>
{
  readonly model: MODEL;
  readonly promptTemplate: TextGenerationPromptTemplate<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptTemplate,
  }: {
    model: MODEL;
    promptTemplate: TextGenerationPromptTemplate<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptTemplate = promptTemplate;
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
        this.promptTemplate.format(prompt)
      )) as MODEL["countPromptTokens"] extends undefined
      ? undefined
      : (prompt: PROMPT) => PromiseLike<number>;
  }

  doGenerateTexts(prompt: PROMPT, options?: FunctionCallOptions) {
    const mappedPrompt = this.promptTemplate.format(prompt);
    return this.model.doGenerateTexts(mappedPrompt, options);
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.model.restoreGeneratedTexts(rawResponse);
  }

  get settingsForEvent(): Partial<SETTINGS> {
    return this.model.settingsForEvent;
  }

  asToolCallGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallPromptTemplate<INPUT_PROMPT, PROMPT>
  ) {
    return new TextGenerationToolCallModel({
      model: this,
      format: promptTemplate,
    });
  }

  asToolCallsOrTextGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallsPromptTemplate<INPUT_PROMPT, PROMPT>
  ) {
    return new TextGenerationToolCallsModel({
      model: this,
      template: promptTemplate,
    });
  }

  asStructureGenerationModel<INPUT_PROMPT>(
    promptTemplate: StructureFromTextPromptTemplate<INPUT_PROMPT, PROMPT>
  ) {
    return new StructureFromTextGenerationModel({
      model: this,
      template: promptTemplate,
    });
  }

  withJsonOutput(schema: Schema<unknown> & JsonSchemaProducer): this {
    return new PromptTemplateTextGenerationModel({
      model: this.model.withJsonOutput(schema),
      promptTemplate: this.promptTemplate,
    }) as this;
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, PROMPT>
  ): PromptTemplateTextGenerationModel<INPUT_PROMPT, PROMPT, SETTINGS, this> {
    return new PromptTemplateTextGenerationModel<
      INPUT_PROMPT,
      PROMPT,
      SETTINGS,
      this
    >({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptTemplate.stopSequences,
        ],
      } as Partial<SETTINGS>),
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptTemplateTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptTemplate: this.promptTemplate,
    }) as this;
  }
}
