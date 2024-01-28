import { FunctionCallOptions } from "../../core/FunctionOptions";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { Schema } from "../../core/schema/Schema";
import {
  TextGenerationToolCallModel,
  ToolCallPromptTemplate,
} from "../../tool/generate-tool-call/TextGenerationToolCallModel";
import { TextGenerationToolCallsModel } from "../../tool/generate-tool-calls/TextGenerationToolCallsModel";
import { ToolCallsPromptTemplate } from "../../tool/generate-tool-calls/ToolCallsPromptTemplate";
import { ObjectFromTextGenerationModel } from "../generate-object/ObjectFromTextGenerationModel";
import { ObjectFromTextPromptTemplate } from "../generate-object/ObjectFromTextPromptTemplate";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate";

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

  asObjectGenerationModel<INPUT_PROMPT>(
    promptTemplate: ObjectFromTextPromptTemplate<INPUT_PROMPT, PROMPT>
  ) {
    return new ObjectFromTextGenerationModel({
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

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptTemplateTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptTemplate: this.promptTemplate,
    }) as this;
  }
}
