import { FunctionCallOptions } from "../../core/FunctionOptions";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { Schema } from "../../core/schema/Schema";
import { ObjectFromTextPromptTemplate } from "../generate-object/ObjectFromTextPromptTemplate";
import { ObjectFromTextStreamingModel } from "../generate-object/ObjectFromTextStreamingModel";
import { PromptTemplateTextGenerationModel } from "./PromptTemplateTextGenerationModel";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "./TextGenerationModel";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate";

export class PromptTemplateTextStreamingModel<
    PROMPT,
    MODEL_PROMPT,
    SETTINGS extends TextGenerationModelSettings,
    MODEL extends TextStreamingModel<MODEL_PROMPT, SETTINGS>,
  >
  extends PromptTemplateTextGenerationModel<
    PROMPT,
    MODEL_PROMPT,
    SETTINGS,
    MODEL
  >
  implements TextStreamingModel<PROMPT, SETTINGS>
{
  constructor(options: {
    model: MODEL;
    promptTemplate: TextGenerationPromptTemplate<PROMPT, MODEL_PROMPT>;
  }) {
    super(options);
  }

  doStreamText(prompt: PROMPT, options?: FunctionCallOptions) {
    const mappedPrompt = this.promptTemplate.format(prompt);
    return this.model.doStreamText(mappedPrompt, options);
  }

  extractTextDelta(delta: unknown) {
    return this.model.extractTextDelta(delta);
  }

  asObjectGenerationModel<INPUT_PROMPT>(
    promptTemplate: ObjectFromTextPromptTemplate<INPUT_PROMPT, PROMPT>
  ) {
    return new ObjectFromTextStreamingModel({
      model: this,
      template: promptTemplate,
    });
  }

  withJsonOutput(schema: Schema<unknown> & JsonSchemaProducer): this {
    return new PromptTemplateTextStreamingModel({
      model: this.model.withJsonOutput(schema),
      promptTemplate: this.promptTemplate,
    }) as this;
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptTemplateTextStreamingModel({
      model: this.model.withSettings(additionalSettings),
      promptTemplate: this.promptTemplate,
    }) as this;
  }
}
